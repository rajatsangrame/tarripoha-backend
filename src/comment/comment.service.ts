import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from './entity/comment.entity';
import { Repository } from 'typeorm';
import { InsertCommentDto } from './dto/insert-comment.dto';
import { GetCommentsDto } from './dto/get-comments.dto';
import { ContentValidator } from '../common/service/content-validation.service';
import { PagingResponse } from 'src/common/interface/paging-response';

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

  async getComments(dto: GetCommentsDto): Promise<PagingResponse<Comment>> {
    try {
      const { pageNo = 1, pageSize = 20, contentId, contentType } = dto;
      const offset = (pageNo - 1) * pageSize;
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
    } catch (error) {
      throw error;
    }
  }
}
