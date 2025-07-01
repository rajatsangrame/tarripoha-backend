import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ContentType } from '../enum/content-type.enum';
import { Word } from '../../words/entity/word.entity';
import { Comment } from '../../comments/entity/comment.entity';

@Injectable()
export class ContentValidator {
  constructor(
    @InjectRepository(Word)
    private readonly wordRepository: Repository<Word>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  async validateContent(
    contentType: ContentType,
    contentId: number,
  ): Promise<{ isValid: boolean; message?: string }> {
    switch (contentType) {
      case ContentType.WORD: {
        const word = await this.wordRepository.findOne({
          where: { id: contentId },
        });
        if (!word) {
          return { isValid: false, message: 'Content does not exists.' };
        } else if (!word.isActive || !word.isApproved) {
          return {
            isValid: false,
            message: 'Content is not active or approved.',
          };
        }
        return { isValid: true };
      }

      case ContentType.COMMENT: {
        const comment = await this.commentRepository.findOne({
          where: { id: contentId },
        });
        if (!comment) {
          return { isValid: false, message: 'Content does not exists.' };
        } else if (!comment.isActive) {
          return { isValid: false, message: 'Content is not active.' };
        }
        return { isValid: true };
      }
      default:
        return { isValid: false, message: 'Invalid content type' };
    }
  }
}
