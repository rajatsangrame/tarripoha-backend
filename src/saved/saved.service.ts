import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Saved } from './entity/saved.entity';
import { InsertSavedDto } from './dto/insert-saved.dto';
import { GetSavedDto } from './dto/get-saved.dto';
import { ContentValidator } from '../common/service/content-validation.service';
import { PagingResponse } from 'src/common/interface/paging-response';
import { plainToInstance } from 'class-transformer';
import { WordResponseDto } from 'src/words/dto/words-response.dto';

@Injectable()
export class SavedService {
  constructor(
    @InjectRepository(Saved) private savedRepository: Repository<Saved>,
    private readonly contentValidator: ContentValidator,
  ) {}

  async insertSaved(userId: number, dto: InsertSavedDto): Promise<Saved> {
    try {
      const { isValid, message } = await this.contentValidator.validateContent(
        dto.contentType,
        dto.contentId,
      );
      if (!isValid) {
        throw new BadRequestException(message);
      }
      const savedData = { ...dto, userId };
      const saved = this.savedRepository.create(savedData);
      await this.savedRepository.upsert(savedData, {
        conflictPaths: ['userId', 'contentId', 'contentType'],
      });
      return saved;
    } catch (error) {
      throw error;
    }
  }

  async getSaved(
    userId: number,
    dto: GetSavedDto,
  ): Promise<PagingResponse<WordResponseDto>> {
    try {
      const { pageNo, pageSize, contentType } = dto;
      const offset = (pageNo - 1) * pageSize;

      const queryBuilder = this.savedRepository
        .createQueryBuilder('saved')
        .leftJoin('word', 'w', 'saved.content_id = w.id')
        .leftJoin('like', 'l', 'l.content_id = w.id AND l.user_id = :userId', {
          userId,
        })
        .where(
          'saved.user_id = :userId AND saved.content_type = :contentType AND saved.is_active = TRUE AND w.is_active = TRUE',
          { userId, contentType },
        )
        .select(['w.*'])
        .addSelect('COALESCE(l.is_active, FALSE)', 'is_liked')
        .addSelect('COALESCE(saved.is_active, FALSE)', 'is_saved');
      const [data, total] = await Promise.all([
        queryBuilder.offset(offset).limit(pageSize).getRawMany(),
        queryBuilder.getCount(),
      ]);

      const wordResponse = plainToInstance(WordResponseDto, data, {
        excludeExtraneousValues: true,
      });

      return new PagingResponse(total, pageNo, pageSize, wordResponse);
    } catch (error) {
      throw error;
    }
  }
}
