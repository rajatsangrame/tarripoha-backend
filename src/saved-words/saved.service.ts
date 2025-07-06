import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SavedWord } from './entity/saved-word.entity';
import { SavedResponseDto } from './dto/saved-word-response.dto';
import { ContentValidator } from '../common/service/content-validation.service';
import { PagingResponse } from 'src/common/interface/paging-response';
import { plainToInstance } from 'class-transformer';
import { WordResponseDto } from 'src/words/dto/words-response.dto';
import { SavedWordDto } from './dto/saved-word.dto';
import { ContentType } from 'src/common/enum/content-type.enum';
import { GetSavedWordDto } from './dto/get-saved-word.dto';

@Injectable()
export class SavedService {
  constructor(
    @InjectRepository(SavedWord) private savedRepository: Repository<SavedWord>,
    private readonly contentValidator: ContentValidator,
  ) { }

  async insertSavedWord(
    userId: number,
    dto: SavedWordDto,
  ): Promise<SavedResponseDto> {
    try {
      const { wordId } = dto;
      const { isValid, message } = await this.contentValidator.validateContent(
        ContentType.WORD,
        wordId,
      );
      if (!isValid) {
        throw new BadRequestException(message);
      }
      const savedData = { ...dto, userId };
      const saved = this.savedRepository.create(savedData);
      await this.savedRepository.upsert(saved, {
        conflictPaths: ['userId', 'wordId'],
      });
      const savedResponse = new SavedResponseDto(
        true,
      );
      return savedResponse;
    } catch (error) {
      throw error;
    }
  }

  async deleteSavedWord(
    userId: number,
    dto: SavedWordDto,
  ): Promise<SavedResponseDto> {
    try {
      const { wordId } = dto;

      const existingSaved = await this.savedRepository.findOne({
        where: {
          userId,
          wordId,
        },
      });

      if (!existingSaved) {
        throw new NotFoundException('Saved item not found');
      }
      await this.savedRepository.remove(existingSaved);

      const savedResponse = new SavedResponseDto(
        true,
      );
      return savedResponse;
    } catch (error) {
      throw error;
    }
  }

  async getSavedWords(
    userId: number,
    dto: GetSavedWordDto,
  ): Promise<PagingResponse<WordResponseDto>> {
    try {
      const { pageNo, pageSize } = dto;
      const offset = (pageNo - 1) * pageSize;

      const queryBuilder = this.savedRepository
        .createQueryBuilder('saved')
        .leftJoin('words', 'w', 'saved.word_id = w.id')
        .select(['w.*'])
        .addSelect(
          `EXISTS(
            SELECT 1 FROM likes l 
            WHERE l.content_id = w.id 
            AND l.content_type = :contentType 
            AND l.user_id = :userId
          )`,
          'is_liked'
        )
        .addSelect(
          `EXISTS(
            SELECT 1 FROM saved_words sv 
            WHERE sv.word_id = w.id 
            AND sv.user_id = :userId
          )`,
          'is_saved'
        )
        .setParameter('contentType', 'word')
        .setParameter('userId', userId)
        .where(
          'saved.user_id = :userId AND w.is_active = TRUE',
          { userId }
        );


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
