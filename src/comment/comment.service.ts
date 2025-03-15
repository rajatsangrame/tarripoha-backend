import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from './entity/comment.entity';
import { Repository } from 'typeorm';
import { InsertCommentDto } from './dto/insert-comment.dto';
import { GetCommentsDto } from './dto/get-comments.dto';
import { ContentValidator } from '../common/service/content-validation.service';
import { PagingResponse } from 'src/common/interface/paging-response';
import { CommentResponseDto } from './dto/comment-response.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment) private commentRepository: Repository<Comment>,
    private readonly contentValidator: ContentValidator,
  ) {}

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

      if (!userId) {
        const [comments, count] = await this.commentRepository.findAndCount({
          where: {
            contentId,
            contentType,
            isActive: true,
          },
          skip: offset,
          take: pageSize,
        });
        return new PagingResponse(count, pageNo, pageSize, comments);
      }

      const queryBuilder = await this.commentRepository
        .createQueryBuilder('comment')
        .select(['comment.*'])
        .leftJoin('user', 'u', 'u.id = comment.userId')
        .leftJoin(
          'like',
          'l',
          'l.contentId = comment.id AND l.contentType = 2 AND l.userId = :userId',
          { userId },
        )
        .addSelect('COALESCE(l.is_active, FALSE)', 'is_liked')
        .addSelect('u.username', 'username')
        .addSelect('u.first_name', 'first_name')
        .addSelect('u.last_name', 'last_name')
        .where('comment.contentId = :contentId', { contentId })
        .andWhere('comment.contentType = :contentType', { contentType })
        .andWhere('comment.isActive = TRUE')
        .skip(offset)
        .take(pageSize)
        .orderBy('comment.createdAt', 'ASC');

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
}
