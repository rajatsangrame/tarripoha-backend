import { Test, TestingModule } from '@nestjs/testing';
import { SavedService } from './saved.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ContentValidator } from '../common/service/content-validation.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SavedWord } from './entity/saved-word.entity';
import { SavedWordDto } from './dto/saved-word.dto';
import { SavedResponseDto } from './dto/saved-word-response.dto';
import { GetSavedWordDto } from './dto/get-saved-word.dto';
import { ContentType } from 'src/common/enum/content-type.enum';
import { PagingResponse } from 'src/common/interface/paging-response';
import { WordResponseDto } from 'src/words/dto/words-response.dto';

describe('SavedService', () => {
  let service: SavedService;
  let savedRepository: Repository<SavedWord>;
  let contentValidator: ContentValidator;

  const mockSavedRepository = {
    create: jest.fn(),
    upsert: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockContentValidator = {
    validateContent: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SavedService,
        {
          provide: getRepositoryToken(SavedWord),
          useValue: mockSavedRepository,
        },
        {
          provide: ContentValidator,
          useValue: mockContentValidator,
        },
      ],
    }).compile();

    service = module.get<SavedService>(SavedService);
    savedRepository = module.get<Repository<SavedWord>>(getRepositoryToken(SavedWord));
    contentValidator = module.get<ContentValidator>(ContentValidator);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('insertSavedWord', () => {
    const userId = 1;
    const insertSavedDto: SavedWordDto = {
      wordId: 100,
    };
    const mockSaved: SavedWord = {
      ...insertSavedDto,
      userId,
      id: 1,
      createdAt: new Date(),
    } as SavedWord;

    it('should insert a saved word if the content is valid', async () => {
      mockContentValidator.validateContent.mockResolvedValueOnce({
        isValid: true,
      });
      mockSavedRepository.create.mockReturnValueOnce(mockSaved);
      mockSavedRepository.upsert.mockResolvedValueOnce(undefined);

      const result = await service.insertSavedWord(userId, insertSavedDto);

      expect(contentValidator.validateContent).toHaveBeenCalledWith(
        ContentType.WORD,
        insertSavedDto.wordId,
      );
      expect(savedRepository.create).toHaveBeenCalledWith({
        ...insertSavedDto,
        userId,
      });
      expect(savedRepository.upsert).toHaveBeenCalledWith(mockSaved, {
        conflictPaths: ['userId', 'wordId'],
      });
      expect(result).toEqual(new SavedResponseDto(true));
    });

    it('should throw BadRequestException if content is invalid', async () => {
      jest.clearAllMocks();

      mockContentValidator.validateContent.mockResolvedValueOnce({
        isValid: false,
        message: 'Content not found',
      });

      await expect(service.insertSavedWord(userId, insertSavedDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(contentValidator.validateContent).toHaveBeenCalledWith(
        ContentType.WORD,
        insertSavedDto.wordId,
      );
      expect(savedRepository.create).not.toHaveBeenCalled();
      expect(savedRepository.upsert).not.toHaveBeenCalled();
    });
  });

  describe('deleteSavedWord', () => {
    const userId = 1;
    const deleteSavedDto: SavedWordDto = {
      wordId: 100,
    };
    const mockSaved: SavedWord = {
      ...deleteSavedDto,
      userId,
      id: 1,
      createdAt: new Date(),
    } as SavedWord;

    it('should delete a saved word if it exists', async () => {
      mockSavedRepository.findOne.mockResolvedValueOnce(mockSaved);
      mockSavedRepository.remove.mockResolvedValueOnce(undefined);

      const result = await service.deleteSavedWord(userId, deleteSavedDto);

      expect(savedRepository.findOne).toHaveBeenCalledWith({
        where: {
          userId,
          wordId: deleteSavedDto.wordId,
        },
      });
      expect(savedRepository.remove).toHaveBeenCalledWith(mockSaved);
      expect(result).toEqual(new SavedResponseDto(true));
    });

    it('should throw NotFoundException if saved word does not exist', async () => {
      mockSavedRepository.findOne.mockResolvedValueOnce(null);

      await expect(service.deleteSavedWord(userId, deleteSavedDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(savedRepository.findOne).toHaveBeenCalledWith({
        where: {
          userId,
          wordId: deleteSavedDto.wordId,
        },
      });
      expect(savedRepository.remove).not.toHaveBeenCalled();
    });
  });

  describe('getSavedWords', () => {
    const userId = 1;
    const getSavedDto: GetSavedWordDto = {
      pageNo: 1,
      pageSize: 10,
    };

    it('should return saved words with pagination', async () => {
      const mockQueryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        setParameter: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        offset: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValueOnce([]),
        getCount: jest.fn().mockResolvedValueOnce(0),
      };
      mockSavedRepository.createQueryBuilder.mockReturnValueOnce(mockQueryBuilder);

      const result = await service.getSavedWords(userId, getSavedDto);

      expect(mockSavedRepository.createQueryBuilder).toHaveBeenCalledWith('saved');
      expect(result).toBeInstanceOf(PagingResponse);
      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });
  });
});
