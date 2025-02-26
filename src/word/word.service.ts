import { BadRequestException, Injectable } from '@nestjs/common';
import { InsertWordDto } from './dto/insert-word-dto';
import { Word } from './entity/word.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { POSTGRES_ERROR_CODES } from '../common/constants/postgres.constants';
import { SearchWordDto } from 'src/word/dto/search-word-dto';
import { SearchResponseDto } from './dto/search-response-dto';

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

  async search(dto: SearchWordDto): Promise<SearchResponseDto> {
    try {
      const { query, languageId, pageNo = 1, pageSize = 10 } = dto;
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
        .where("word.search_vector @@ plainto_tsquery('english',:query)", {
          query,
        })
        .orderBy('rank', 'DESC')
        .skip(offset)
        .take(pageSize);

      if (languageId) {
        queryBuilder.andWhere('word.language_id = :languageId', {
          languageId: languageId,
        });
      }

      queryBuilder.orderBy('rank', 'DESC');

      const [words, total] = await queryBuilder.getManyAndCount();
      return new SearchResponseDto(total, pageNo, pageSize, words);
    } catch (error) {
      throw error;
    }
  }
}
