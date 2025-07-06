import { BadRequestException, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from './entity/comment.entity';
import { Repository } from 'typeorm';
import { InsertCommentDto } from './dto/insert-comment.dto';
import { GetCommentsDto } from './dto/get-comments.dto';
import { ContentValidator } from '../common/service/content-validation.service';
import { PagingResponse } from 'src/common/interface/paging-response';
import { CommentResponseDto } from './dto/comment-response.dto';
import { plainToInstance } from 'class-transformer';
import { ContentType } from 'src/common/enum/content-type.enum';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment) private commentRepository: Repository<Comment>,
    private readonly contentValidator: ContentValidator,
  ) { }

  async insertComment(userId: number, dto: InsertCommentDto): Promise<Comment> {
    try {
      const { isValid, message } = await this.contentValidator.validateContent(
        dto.contentType,
        dto.contentId,
      );
      if (!isValid) {
        throw new BadRequestException(message);
      }
      const commentData = { ...dto, userId };
      const comment = this.commentRepository.create(commentData);
      await this.commentRepository.save(comment);
      return comment;
    } catch (error) {
      throw error;
    }
  }

  async getComments(userId: number, dto: GetCommentsDto) {
    try {
      const { pageNo = 1, pageSize = 20, contentId, contentType } = dto;
      const offset = (pageNo - 1) * pageSize;

      const queryBuilder = this.commentRepository
        .createQueryBuilder('comment')
        .leftJoin('user', 'u', 'u.id = comment.user_id')
        .leftJoin(
          'likes',
          'user_like',
          'user_like.content_id = comment.id AND user_like.content_type = :commentContentType AND user_like.user_id = :userId'
        )
        .leftJoin(
          'likes',
          'total_likes',
          'total_likes.content_id = comment.id AND total_likes.content_type = :commentContentType'
        )
        .select([
          'comment.*',
          'u.username AS username',
          'u.first_name AS first_name',
          'u.last_name AS last_name',
          'CASE WHEN user_like.id IS NOT NULL THEN true ELSE false END AS is_liked',
          'COUNT(DISTINCT total_likes.id) AS total_likes'
        ])
        .where('comment.content_id = :contentId', { contentId })
        .andWhere('comment.content_type = :type', { type: contentType })
        .groupBy('comment.id, u.id, user_like.id')
        .orderBy('comment.created_at', 'ASC')
        .setParameters({
          commentContentType: ContentType.COMMENT,
          userId,
          contentId,
          type: contentType,
        });

      const [comments, total] = await Promise.all([
        queryBuilder.offset(offset).limit(pageSize).getRawMany(),
        queryBuilder.getCount(),
      ]);

      const commentResponse = plainToInstance(CommentResponseDto, comments, {
        excludeExtraneousValues: true,
      });

      return new PagingResponse(total, pageNo, pageSize, commentResponse);
    } catch (error) {
      throw error;
    }
  }

  async deleteComment(userId: number, commentId: number): Promise<{ sucess: boolean }> {
    try {
      const comment = await this.commentRepository.findOne({
        where: { id: commentId },
      });

      if (!comment) {
        throw new NotFoundException('Comment not found');
      }

      if (comment.userId !== userId) {
        throw new ForbiddenException('You can only delete your own comments');
      }

      await this.commentRepository.remove(comment);
      
      return { sucess: true };
    } catch (error) {
      throw error;
    }
  }
}
