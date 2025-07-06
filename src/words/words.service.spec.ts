import { Test, TestingModule } from '@nestjs/testing';
import { WordService } from './words.service';
import { Repository } from 'typeorm';
import { Word } from './entity/word.entity';
import { User } from '../users/entity/user.entity';
import { UserRoleMapping } from '../users/entity/user-mappping.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InsertWordDto } from './dto/insert-word.dto';
import { SearchWordDto } from './dto/search-word.dto';
import { UpdateWordDto } from './dto/update-word.dto';
import { WordResponseDto } from './dto/words-response.dto';
import { PagingResponse } from '../common/interface/paging-response';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { POSTGRES_ERROR_CODES } from '../common/constants/postgres.constants';

const mockWordRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  createQueryBuilder: jest.fn(),
};

const mockUserRepository = {
  findOneBy: jest.fn(),
};

const mockUserRoleMappingRepository = {
  findBy: jest.fn(),
};

describe('WordService', () => {
  let service: WordService;
  let wordRepository: Repository<Word>;
  let userRepository: Repository<User>;
  let userRoleMappingRepository: Repository<UserRoleMapping>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WordService,
        {
          provide: getRepositoryToken(Word),
          useValue: mockWordRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(UserRoleMapping),
          useValue: mockUserRoleMappingRepository,
        },
      ],
    }).compile();

    service = module.get<WordService>(WordService);
    wordRepository = module.get<Repository<Word>>(getRepositoryToken(Word));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    userRoleMappingRepository = module.get<Repository<UserRoleMapping>>(
      getRepositoryToken(UserRoleMapping),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('insertWord', () => {
    it('should insert a word and return it', async () => {
      const userId = 1;
      const dto: InsertWordDto = {
        name: 'test',
        meaning: 'A test word',
        englishMeaning: 'test',
        languageId: 1,
      };
      const wordEntity: Word = {
        id: 1,
        name: 'test',
        meaning: 'A test word',
        englishMeaning: 'test',
        languageId: 1,
        userId,
      } as Word;

      mockWordRepository.create.mockReturnValue(wordEntity);
      mockWordRepository.save.mockResolvedValue(wordEntity);

      const result = await service.insertWord(userId, dto);

      expect(wordRepository.create).toHaveBeenCalledWith({ ...dto, userId });
      expect(wordRepository.save).toHaveBeenCalledWith(wordEntity);
      expect(result).toEqual(wordEntity);
    });

    it('should throw BadRequestException if word already exists', async () => {
      const userId = 1;
      const dto: InsertWordDto = {
        name: 'test',
        meaning: 'A test word',
        englishMeaning: 'test',
        languageId: 1,
      };

      const error = {
        code: POSTGRES_ERROR_CODES.UNIQUE_VIOLATION,
      };

      mockWordRepository.create.mockReturnValue({});
      mockWordRepository.save.mockRejectedValue(error);

      await expect(service.insertWord(userId, dto)).rejects.toThrow(
        BadRequestException,
      );

      expect(wordRepository.create).toHaveBeenCalledWith({ ...dto, userId });
      expect(wordRepository.save).toHaveBeenCalled();
    });

    it('should throw the original error if it is not a unique violation', async () => {
      const userId = 1;
      const dto: InsertWordDto = {
        name: 'test',
        meaning: 'A test word',
        englishMeaning: 'test',
        languageId: 1,
      };

      const error = new Error('Some other error');

      mockWordRepository.create.mockReturnValue({});
      mockWordRepository.save.mockRejectedValue(error);

      await expect(service.insertWord(userId, dto)).rejects.toThrow(error);

      expect(wordRepository.create).toHaveBeenCalledWith({ ...dto, userId });
      expect(wordRepository.save).toHaveBeenCalled();
    });
  });

  describe('updateWord', () => {
    it('should update a word and return it', async () => {
      const userId = 1;
      const wordId = 1;
      const dto: UpdateWordDto = {
        name: 'updated test',
        meaning: 'Updated test word',
        languageId: 1,
      };

      const existingWord: Word = {
        id: wordId,
        name: 'test',
        meaning: 'A test word',
        englishMeaning: 'test',
        languageId: 1,
        userId,
      } as Word;

      const updatedWord: Word = {
        ...existingWord,
        ...dto,
      } as Word;

      const mockWordResponse: WordResponseDto = {
        id: wordId,
        name: 'updated test',
        meaning: 'Updated test word',
        languageId: 1,
        userId,
        englishMeaning: 'test',
        description: 'test description',
        tags: 'test,tag',
        isActive: true,
        isApproved: true,
        isLiked: false,
        isSaved: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: null,
      };

      mockWordRepository.findOne.mockResolvedValue(existingWord);
      mockWordRepository.save.mockResolvedValue(updatedWord);
      mockUserRepository.findOneBy.mockResolvedValue({ id: userId, isActive: true });
      mockUserRoleMappingRepository.findBy.mockResolvedValue([]);
      mockWordRepository.createQueryBuilder.mockReturnValue({
        leftJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        setParameter: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({
          id: wordId,
          name: 'updated test',
          meaning: 'Updated test word',
          language_id: 1,
          user_id: userId,
          english_meaning: 'test',
          description: 'test description',
          tags: 'test,tag',
          is_active: true,
          is_approved: true,
          is_liked: false,
          is_saved: false,
          created_at: new Date(),
          updated_at: new Date(),
        }),
      });

      const result = await service.updateWord(userId, wordId, dto);

      expect(wordRepository.findOne).toHaveBeenCalledWith({
        where: { id: wordId },
      });
      expect(wordRepository.save).toHaveBeenCalledWith(updatedWord);
      expect(result).toEqual(mockWordResponse);
    });

    it('should throw BadRequestException if dto is empty', async () => {
      const userId = 1;
      const wordId = 1;
      const dto: UpdateWordDto = {} as UpdateWordDto;

      await expect(service.updateWord(userId, wordId, dto)).rejects.toThrow(
        BadRequestException,
      );

      expect(wordRepository.findOne).not.toHaveBeenCalled();
      expect(wordRepository.save).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if word not found', async () => {
      const userId = 1;
      const wordId = 1;
      const dto: UpdateWordDto = {
        name: 'updated test',
        meaning: 'Updated test word',
        languageId: 1,
      };

      mockWordRepository.findOne.mockResolvedValue(null);

      await expect(service.updateWord(userId, wordId, dto)).rejects.toThrow(
        NotFoundException,
      );

      expect(wordRepository.findOne).toHaveBeenCalledWith({
        where: { id: wordId },
      });
      expect(wordRepository.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if unique violation occurs', async () => {
      const userId = 1;
      const wordId = 1;
      const dto: UpdateWordDto = {
        name: 'updated test',
        meaning: 'Updated test word',
        languageId: 1,
      };

      const existingWord: Word = {
        id: wordId,
        name: 'test',
        meaning: 'A test word',
        englishMeaning: 'test',
        languageId: 1,
        userId,
      } as Word;

      const error = {
        code: POSTGRES_ERROR_CODES.UNIQUE_VIOLATION,
      };

      mockWordRepository.findOne.mockResolvedValue(existingWord);
      mockWordRepository.save.mockRejectedValue(error);

      await expect(service.updateWord(userId, wordId, dto)).rejects.toThrow(
        BadRequestException,
      );

      expect(wordRepository.findOne).toHaveBeenCalledWith({
        where: { id: wordId },
      });
      expect(wordRepository.save).toHaveBeenCalled();
    });
  });

  describe('getWord', () => {
    it('should get a word by id and return it', async () => {
      const userId = 1;
      const wordId = 1;

      const mockUser = { id: userId, isActive: true };
      const mockUserRoles = [];

      const mockRawWord = {
        id: wordId,
        name: 'test',
        meaning: 'A test word',
        language_id: 1,
        user_id: userId,
        english_meaning: 'test',
        description: 'test description',
        tags: 'test,tag',
        is_active: true,
        is_approved: true,
        is_liked: false,
        is_saved: false,
        created_at: new Date(),
        updated_at: new Date(),
        username: 'testuser',
        first_name: 'Test',
        last_name: 'User',
      };

      const mockWordResponse: WordResponseDto = {
        id: wordId,
        name: 'test',
        meaning: 'A test word',
        languageId: 1,
        userId,
        englishMeaning: 'test',
        description: 'test description',
        tags: 'test,tag',
        isActive: true,
        isApproved: true,
        isLiked: false,
        isSaved: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          username: 'testuser',
          firstName: 'Test',
          lastName: 'User',
        },
      };

      mockUserRepository.findOneBy.mockResolvedValue(mockUser);
      mockUserRoleMappingRepository.findBy.mockResolvedValue(mockUserRoles);
      mockWordRepository.createQueryBuilder.mockReturnValue({
        leftJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        setParameter: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(mockRawWord),
      });

      const result = await service.getWord(userId, wordId);

      expect(userRepository.findOneBy).toHaveBeenCalledWith({
        id: userId,
        isActive: true,
      });
      expect(userRoleMappingRepository.findBy).toHaveBeenCalledWith({ userId });
      expect(result).toEqual(mockWordResponse);
    });

    it('should throw NotFoundException if word not found', async () => {
      const userId = 1;
      const wordId = 1;

      const mockUser = { id: userId, isActive: true };
      const mockUserRoles = [];

      mockUserRepository.findOneBy.mockResolvedValue(mockUser);
      mockUserRoleMappingRepository.findBy.mockResolvedValue(mockUserRoles);
      mockWordRepository.createQueryBuilder.mockReturnValue({
        leftJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        setParameter: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(null),
      });

      await expect(service.getWord(userId, wordId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('search', () => {
    it('should search words and return paging response', async () => {
      const userId = 1;
      const dto: SearchWordDto = {
        query: 'test',
        languageId: 1,
        pageNo: 1,
        pageSize: 20,
      };

      const mockRawWords = [
        {
          id: 1,
          name: 'test',
          meaning: 'A test word',
          language_id: 1,
          user_id: userId,
          english_meaning: 'test',
          description: 'test description',
          tags: 'test,tag',
          is_active: true,
          is_approved: true,
          is_liked: false,
          is_saved: false,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      const mockWordResponse: WordResponseDto = {
        id: 1,
        name: 'test',
        meaning: 'A test word',
        languageId: 1,
        userId,
        englishMeaning: 'test',
        description: 'test description',
        tags: 'test,tag',
        isActive: true,
        isApproved: true,
        isLiked: false,
        isSaved: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: null,
      };

      const mockPagingResponse = new PagingResponse(1, 1, 20, [mockWordResponse]);

      mockWordRepository.createQueryBuilder.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        setParameter: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        offset: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockRawWords),
        getCount: jest.fn().mockResolvedValue(1),
      });

      const result = await service.search(userId, dto);

      expect(wordRepository.createQueryBuilder).toHaveBeenCalledWith('word');
      expect(result).toEqual(mockPagingResponse);
    });

    it('should handle search without languageId filter', async () => {
      const userId = 1;
      const dto: SearchWordDto = {
        query: 'test',
        pageNo: 1,
        pageSize: 20,
      } as SearchWordDto;

      const mockRawWords = [];
      const mockPagingResponse = new PagingResponse(0, 1, 20, []);

      mockWordRepository.createQueryBuilder.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        setParameter: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        offset: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockRawWords),
        getCount: jest.fn().mockResolvedValue(0),
      });

      const result = await service.search(userId, dto);

      expect(wordRepository.createQueryBuilder).toHaveBeenCalledWith('word');
      expect(result).toEqual(mockPagingResponse);
    });
  });
});
