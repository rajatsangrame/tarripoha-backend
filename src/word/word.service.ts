import { BadRequestException, Injectable } from '@nestjs/common';
import { InsertWordDto } from './dto/insert-word-dto';
import { Word } from './entity/word.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { POSTGRES_ERROR_CODES } from '../common/constants/postgres.constants';
import { SearchWordDto } from 'src/word/dto/search-word-dto';
import { WordResponse } from './dto/words-response-dto';
import { PagingResponse } from 'src/common/interface/PagingResponse';

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

  async getWords(): Promise<Word[]> {
    try {
      const words = await this.wordRepository.findBy({ isActive: true });
      return words;
    } catch (error) {
      throw error;
    }
  }

  async search(
    userId: number,
    dto: SearchWordDto,
  ): Promise<PagingResponse<WordResponse>> {
    try {
      const { query, languageId, pageNo = 1, pageSize = 20 } = dto;
      const offset = (pageNo - 1) * pageSize;
      const queryBuilder = this.wordRepository.createQueryBuilder('word');
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
      if (userId) {
        queryBuilder
          .addSelect('COALESCE(l.is_active, FALSE)', 'is_liked')
          .leftJoin(
            'like',
            'l',
            'l.content_id = word.id AND l.content_type = 1 AND l.user_id = :userId',
            { userId },
          )
          .addSelect('COALESCE(sv.is_active, FALSE)', 'is_saved')
          .leftJoin(
            'saved',
            'sv',
            'sv.content_id = word.id AND sv.content_type = 1 AND sv.user_id = :userId',
            { userId },
          );
      }
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
        .orderBy('rank', 'DESC')
        .addOrderBy('similarity_score', 'DESC');

      if (languageId) {
        queryBuilder.andWhere('word.language_id = :languageId', {
          languageId: languageId,
        });
      }

      const [words, total] = await Promise.all([
        queryBuilder.offset(offset).limit(pageSize).getRawMany(),
        queryBuilder.getCount(),
      ]);

      const wordResponse: WordResponse[] = words.map((word) => ({
        id: word.word_id,
        languageId: word.word_language_id,
        userId: word.word_user_id,
        name: word.word_name,
        meaning: word.word_meaning,
        englishMeaning: word.word_english_meaning,
        description: word.word_description,
        isActive: word.word_is_active,
        isApproved: word.word_is_approved,
        isLiked: word.is_liked,
        isSaved: word.is_saved,
      }));
      return new PagingResponse(total, pageNo, pageSize, wordResponse);
    } catch (error) {
      throw error;
    }
  }
}
