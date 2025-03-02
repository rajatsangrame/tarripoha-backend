import { Test, TestingModule } from '@nestjs/testing';
import { SavedService } from './saved.service';
import { Repository } from 'typeorm';
import { Saved } from './entity/saved.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ContentValidator } from '../common/service/content-validation.service';
import { BadRequestException } from '@nestjs/common';
import { InsertSavedDto } from './dto/insert-saved-dto';
import { GetSavedDto } from './dto/get-saved-dto';

describe('SavedService', () => {
  let service: SavedService;
  let savedRepository: Repository<Saved>;
  let contentValidator: ContentValidator;

  const mockSavedRepository = {
    create: jest.fn(),
    save: jest.fn(),
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
          provide: getRepositoryToken(Saved),
          useValue: mockSavedRepository,
        },
        {
          provide: ContentValidator,
          useValue: mockContentValidator,
        },
      ],
    }).compile();

    service = module.get<SavedService>(SavedService);
    savedRepository = module.get<Repository<Saved>>(getRepositoryToken(Saved));
    contentValidator = module.get<ContentValidator>(ContentValidator);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('insertSaved', () => {
    const userId = 1;
    const insertSavedDto: InsertSavedDto = {
      contentId: 100,
      contentType: 1,
      isActive: true,
    };
    const mockSaved: Saved = {
      ...insertSavedDto,
      userId,
      id: 1,
      isActive: true,
    } as Saved;

    it('should insert a saved if the content is valid', async () => {
      mockContentValidator.validateContent.mockResolvedValueOnce({
        isValid: true,
      });
      mockSavedRepository.create.mockReturnValueOnce(mockSaved);
      mockSavedRepository.save.mockResolvedValueOnce(mockSaved);

      const result = await service.insertSaved(userId, insertSavedDto);

      expect(contentValidator.validateContent).toHaveBeenCalledWith(
        insertSavedDto.contentType,
        insertSavedDto.contentId,
      );
      expect(savedRepository.create).toHaveBeenCalledWith({
        ...insertSavedDto,
        userId,
      });
      expect(savedRepository.save).toHaveBeenCalledWith(mockSaved);
      expect(result).toEqual(mockSaved);
    });

    it('should throw BadRequestException if content is invalid', async () => {
      // Clear all the call history of mocks but keeps the mocked implementation.
      // This is needed call we have toHaveBeenCalled above and the state should be reset.
      jest.clearAllMocks();

      mockContentValidator.validateContent.mockResolvedValueOnce({
        isValid: false,
        message: 'Content not found',
      });

      await expect(service.insertSaved(userId, insertSavedDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(contentValidator.validateContent).toHaveBeenCalledWith(
        insertSavedDto.contentType,
        insertSavedDto.contentId,
      );
      expect(savedRepository.create).not.toHaveBeenCalled();
      expect(savedRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('getSaved', () => {
    const getSavedDto: GetSavedDto = {
      contentId: 100,
      contentType: 1,
      userId: 1,
    };

    it('should return saved matching the query', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValueOnce([
          {
            id: 1,
            contentId: getSavedDto.contentId,
            contentType: getSavedDto.contentType,
            userId: getSavedDto.userId,
          },
        ]),
      };
      mockSavedRepository.createQueryBuilder.mockReturnValueOnce(
        mockQueryBuilder,
      );

      const result = await service.getSaved(getSavedDto);

      expect(mockSavedRepository.createQueryBuilder).toHaveBeenCalledWith(
        'saved',
      );
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'saved.contentId = :contentId',
        { contentId: getSavedDto.contentId },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'saved.contentType = :contentType',
        { contentType: getSavedDto.contentType },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'saved.isActive = :isActive',
        { isActive: true },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'saved.userId = :userId',
        { userId: getSavedDto.userId },
      );
      expect(result).toEqual([
        {
          id: 1,
          contentId: getSavedDto.contentId,
          contentType: getSavedDto.contentType,
          userId: getSavedDto.userId,
        },
      ]);
    });
  });
});
