import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Saved } from './entity/saved.entity';
import { InsertSavedDto } from './dto/insert-saved-dto';
import { GetSavedDto } from './dto/get-saved-dto';
import { ContentValidator } from '../common/service/content-validation.service';
import { Word } from 'src/word/entity/word.entity';
import { PagingResponse } from 'src/common/interface/PagingResponse';
import { User } from 'src/user/entity/user.entity';

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
  ): Promise<PagingResponse<Saved>> {
    try {
      const { pageNo, pageSize, contentType } = dto;
      const offset = (pageNo - 1) * pageSize;
      const queryBuilder = await this.savedRepository
        .createQueryBuilder('saved')
        .leftJoinAndSelect(Word, 'word', 'word.id = saved.contentId')
        .leftJoinAndSelect(Like, 'like', 'word.id = like.contentId')
        .where('saved.userId = :userId', { userId })
        .andWhere('saved.contentType = :contentType', {
          contentType,
        })
        .andWhere('saved.isActive = :isActive', { isActive: true })
        .orderBy('saved.createdAt', 'DESC')
        .select([
          'word.id AS id',
          'word.name AS name',
          'word.meaning AS meaning',
          'word.englishMeaning AS "englishMeaning"',
          'word.description AS description',
          'word.created_at AS "createdAt"',
          'word.created_at AS "updatedAt"',
          'word.language_id AS "languageId"',
          'word.user_id AS "userId"',
          'saved.is_active AS "isSaved"',
          'like.is_active AS "isLiked"',
        ])
        .take(pageSize)
        .skip(offset);

      const [data, total] = await Promise.all([
        queryBuilder.getRawMany(),
        queryBuilder.getCount(),
      ]);

      return new PagingResponse(total, pageNo, pageSize, data);
    } catch (error) {
      throw error;
    }
  }
}
