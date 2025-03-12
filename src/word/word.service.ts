import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InsertWordDto } from './dto/insert-word.dto';
import { Word } from './entity/word.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { POSTGRES_ERROR_CODES } from '../common/constants/postgres.constants';
import { SearchWordDto } from 'src/word/dto/search-word.dto';
import { WordResponseDto } from './dto/words-response.dto';
import { PagingResponse } from 'src/common/interface/paging-response';
import { plainToInstance } from 'class-transformer';
import { UpdateWordDto } from './dto/update-word.dto';
import * as _ from 'lodash';

@Injectable()
export class WordService {
  constructor(
    @InjectRepository(Word) private wordRepository: Repository<Word>,
  ) {}
  async insertWord(userId: number, dto: InsertWordDto): Promise<Word> {
    try {
      const wordData = { ...dto, userId };
      const word = this.wordRepository.create(wordData);
      await this.wordRepository.save(word);
      return word;
    } catch (error) {
      if (error.code === POSTGRES_ERROR_CODES.UNIQUE_VIOLATION) {
        throw new BadRequestException('Word already exists');
      }
      throw error;
    }
  }

  async updateWord(
    userId: number,
    wordId: number,
    dto: UpdateWordDto,
  ): Promise<WordResponseDto> {
    try {
      if (_.isEmpty(dto)) {
        throw new BadRequestException('Noting to update in the request');
      }

      const word = await this.wordRepository.findOne({
        where: { id: wordId, userId },
      });

      if (!word) {
        throw new NotFoundException('Word not found or unauthorized');
      }

      Object.assign(word, dto);
      await this.wordRepository.save(word);
      return this.getWord(userId, wordId);
    } catch (error) {
      if (error.code === POSTGRES_ERROR_CODES.UNIQUE_VIOLATION) {
        throw new BadRequestException('Word already exists');
      }
      throw error;
    }
  }

  async getWord(userId: number, id: number): Promise<WordResponseDto> {
    try {
      const queryBuilder = this.wordRepository.createQueryBuilder('word');
      if (userId) {
        queryBuilder
          .leftJoin(
            'like',
            'l',
            'l.content_id = word.id AND l.content_type = 1 AND l.user_id = :userId',
            { userId },
          )
          .leftJoin(
            'saved',
            'sv',
            'sv.content_id = word.id AND sv.content_type = 1 AND sv.user_id = :userId',
            { userId },
          )
          .leftJoin('user', 'u', 'u.id = word.user_id')
          .select(['word.*'])
          .addSelect('COALESCE(l.is_active, FALSE)', 'is_liked')
          .addSelect('COALESCE(sv.is_active, FALSE)', 'is_saved')
          .addSelect('u.username', 'username')
          .addSelect('u.first_name', 'first_name')
          .addSelect('u.last_name', 'last_name');
      }
      queryBuilder.where('word.id = :id AND word.is_active = TRUE', { id });
      const rawWord = await queryBuilder.getRawOne();

      const wordResponse = plainToInstance(WordResponseDto, rawWord, {
        excludeExtraneousValues: true,
      });
      if (rawWord.user_id) {
        wordResponse.user = {
          username: rawWord.username,
          firstName: rawWord.first_name,
          lastName: rawWord.last_name,
        };
      }
      return wordResponse;
    } catch (error) {
      throw error;
    }
  }

  async search(
    userId: number,
    dto: SearchWordDto,
  ): Promise<PagingResponse<WordResponseDto>> {
    try {
      const { query, languageId, pageNo = 1, pageSize = 20 } = dto;
      const offset = (pageNo - 1) * pageSize;
      const queryBuilder = this.wordRepository.createQueryBuilder('word');
      if (userId) {
        queryBuilder
          .leftJoin(
            'like',
            'l',
            'l.content_id = word.id AND l.content_type = 1 AND l.user_id = :userId',
            { userId },
          )
          .leftJoin(
            'saved',
            'sv',
            'sv.content_id = word.id AND sv.content_type = 1 AND sv.user_id = :userId',
            { userId },
          )
          .select(['word.*'])
          .addSelect('COALESCE(l.is_active, FALSE)', 'is_liked')
          .addSelect('COALESCE(sv.is_active, FALSE)', 'is_saved');
      }
      queryBuilder
        .addSelect(
          `CASE 
            WHEN word.name = :query THEN 1.0
            WHEN word.meaning = :query THEN 1.0
            ELSE ts_rank(word.search_vector, plainto_tsquery('english', :query)) 
          END`,
          'rank',
        )
        .addSelect(
          `GREATEST(
            word_similarity(word.name, :query),
            word_similarity(word.meaning, :query),
            word_similarity(word.tags, :query),
            word_similarity(word.english_meaning, :query)
          )`,
          'similarity_score',
        );
      queryBuilder
        .where(
          `(
            word.search_vector @@ plainto_tsquery('english', :query)
            OR word_similarity(word.name, :query) > 0.3
            OR word_similarity(word.meaning, :query) > 0.3
            OR word_similarity(word.tags, :query) > 0.3
            OR word_similarity(word.english_meaning, :query) > 0.3
          )`,
          { query },
        )
        .andWhere('word.is_active = TRUE')
        .orderBy('rank', 'DESC')
        .addOrderBy('similarity_score', 'DESC');

      if (languageId) {
        queryBuilder.andWhere('word.language_id = :languageId', {
          languageId: languageId,
        });
      }

      const [rawWords, total] = await Promise.all([
        queryBuilder.offset(offset).limit(pageSize).getRawMany(),
        queryBuilder.getCount(),
      ]);

      const wordResponse = plainToInstance(WordResponseDto, rawWords, {
        excludeExtraneousValues: true,
      });

      return new PagingResponse(total, pageNo, pageSize, wordResponse);
    } catch (error) {
      throw error;
    }
  }
}
