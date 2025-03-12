import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from './entity/comment.entity';
import { Repository } from 'typeorm';
import { InsertCommentDto } from './dto/insert-comment.dto';
import { GetCommentsDto } from './dto/get-comments.dto';
import { ContentValidator } from '../common/service/content-validation.service';

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

  async getComments(dto: GetCommentsDto): Promise<Comment[]> {
    try {
      const queryBuilder = this.commentRepository.createQueryBuilder('comment');

      queryBuilder.where('comment.contentId = :contentId', {
        contentId: dto.contentId,
      });
      queryBuilder.andWhere('comment.contentType = :contentType', {
        contentType: dto.contentType,
      });
      queryBuilder.andWhere('comment.isActive = :isActive', {
        isActive: true,
      });

      if (dto.userId) {
        queryBuilder.andWhere('comment.userId = :userId', {
          userId: dto.userId,
        });
      }
      const comments = await queryBuilder.getMany();
      return comments;
    } catch (error) {
      throw error;
    }
  }
}
