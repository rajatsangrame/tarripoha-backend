import { Test, TestingModule } from '@nestjs/testing';
import { SavedService } from './saved.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ContentValidator } from '../common/service/content-validation.service';
import { BadRequestException } from '@nestjs/common';
import { SavedWord } from './entity/saved-word.entity';
import { SavedWordDto } from './dto/saved-word.dto';
import { ContentType } from 'src/common/enum/content-type.enum';

describe('SavedService', () => {
  let service: SavedService;
  let savedRepository: Repository<SavedWord>;
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

  describe('insertSaved', () => {
    const userId = 1;
    const insertSavedDto: SavedWordDto = {
      contentId: 100,
      contentType: ContentType.WORD
    };
    const mockSaved: SavedWord = {
      ...insertSavedDto,
      userId,
      id: 1,
      isActive: true,
    } as SavedWord;

    it('should insert a saved if the content is valid', async () => {
      mockContentValidator.validateContent.mockResolvedValueOnce({
        isValid: true,
      });
      mockSavedRepository.create.mockReturnValueOnce(mockSaved);
      mockSavedRepository.save.mockResolvedValueOnce(mockSaved);

      const result = await service.insertSavedWord(userId, insertSavedDto);

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

      await expect(service.insertSavedWord(userId, insertSavedDto)).rejects.toThrow(
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
      contentType: ContentType.WORD
    };

    it('should return saved matching the query', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValueOnce([
          {
            id: 1,
            contentType: getSavedDto.contentType,
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
