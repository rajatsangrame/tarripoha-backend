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
import { SearchWordDto } from 'src/words/dto/search-word.dto';
import { WordResponseDto } from './dto/words-response.dto';
import { PagingResponse } from 'src/common/interface/paging-response';
import { plainToInstance } from 'class-transformer';
import { UpdateWordDto } from './dto/update-word.dto';
import * as _ from 'lodash';
import { User } from 'src/users/entity/user.entity';
import { USER_ROLE } from 'src/guard/role/user-role.enum';
import { UserRoleMapping } from 'src/users/entity/user-mappping.entity';

@Injectable()
export class WordService {
  constructor(
    @InjectRepository(Word) private wordRepository: Repository<Word>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(UserRoleMapping)
    private urmRepository: Repository<UserRoleMapping>,
  ) { }
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
        throw new BadRequestException();
      }

      const word = await this.wordRepository.findOne({
        where: { id: wordId },
      });

      if (!word) {
        throw new NotFoundException('Word not found');
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
    const user = await this.userRepository.findOneBy({
      id: userId,
      isActive: true,
    });
    const userRoles = [];
    if (user) {
      const mappings = await this.urmRepository.findBy({ userId });
      mappings.forEach((e) => {
        userRoles.push(e.userRole.role);
      });
    }

    // Do not filter active words if user has admin or editor role.
    const filterActiveWords = !userRoles.some((role: string) =>
      [USER_ROLE.ADMIN.toString(), USER_ROLE.EDITOR.toString()].includes(role),
    );
    try {
      const queryBuilder = this.wordRepository.createQueryBuilder('word');
      if (userId) {
        queryBuilder
          .leftJoin('users', 'u', 'u.id = word.user_id')
          .select(['word.*'])
          .addSelect(
            `EXISTS(
            SELECT 1 FROM likes l 
            WHERE l.content_id = word.id 
            AND l.content_type = :contentType 
            AND l.user_id = :userId
          )`,
            'is_liked'
          )
          .addSelect(
            `EXISTS(
            SELECT 1 FROM saved_words sv 
            WHERE sv.word_id = word.id 
            AND sv.user_id = :userId
          )`,
            'is_saved'
          )
          .addSelect([
            'u.username as username',
            'u.first_name as first_name',
            'u.last_name as last_name',
          ])
          .setParameter('contentType', 'word')
          .setParameter('userId', userId);
      }
      queryBuilder.where('word.id = :id', { id });
      if (filterActiveWords) queryBuilder.andWhere('word.is_active = TRUE');
      const rawWord = await queryBuilder.getRawOne();

      if (!rawWord) {
        throw new NotFoundException('Word not found');
      }

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
      queryBuilder.select(['word.*']);
      if (userId) {
        queryBuilder
          .addSelect(
            `EXISTS(
              SELECT 1 FROM likes l 
              WHERE l.content_id = word.id 
              AND l.content_type = :contentType 
              AND l.user_id = :userId
            )`,
            'is_liked'
          )
          .addSelect(
            `EXISTS(
              SELECT 1 FROM saved_words sv 
              WHERE sv.word_id = word.id 
              AND sv.user_id = :userId
            )`,
            'is_saved'
          )
          .setParameter('contentType', 'word')
          .setParameter('userId', userId);
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
