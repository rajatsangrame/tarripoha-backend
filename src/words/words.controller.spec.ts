import { Test, TestingModule } from '@nestjs/testing';
import { WordController } from './words.controller';
import { WordService } from './words.service';
import { JwtAuthGuard } from '../guard/auth/jwt.auth.guard';
import { RolesGuard } from '../guard/role/user-role.guard';
import { InsertWordDto } from './dto/insert-word.dto';
import { SearchWordDto } from './dto/search-word.dto';
import { UpdateWordDto } from './dto/update-word.dto';
import { Word } from './entity/word.entity';
import { WordResponseDto } from './dto/words-response.dto';
import { PagingResponse } from '../common/interface/paging-response';
import { ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';

describe('WordController', () => {
  let controller: WordController;
  let service: WordService;

  const mockWordService = {
    insertWord: jest.fn(),
    search: jest.fn(),
    getWord: jest.fn(),
    updateWord: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WordController],
      providers: [
        {
          provide: WordService,
          useValue: mockWordService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true }) // Mocking JwtAuthGuard
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true }) // Mocking RolesGuard
      .compile();

    controller = module.get<WordController>(WordController);
    service = module.get<WordService>(WordService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('insertWord', () => {
    const mockRequest = {
      user: {
        id: 1,
      },
    };

    const dto: InsertWordDto = {
      name: 'test',
      meaning: 'A test word',
      englishMeaning: 'test',
      languageId: 1,
    };

    const mockWord: Word = {
      id: 1,
      name: 'test',
      meaning: 'A test word',
      userId: mockRequest.user.id,
    } as Word;

    it('should insert a word and return it', async () => {
      mockWordService.insertWord.mockResolvedValue(mockWord);

      const result = await controller.insertWord(dto, mockRequest);

      expect(mockWordService.insertWord).toHaveBeenCalledWith(
        mockRequest.user.id,
        dto,
      );
      expect(result).toEqual(mockWord);
    });

    it('should throw an error if service fails', async () => {
      mockWordService.insertWord.mockRejectedValue(
        new ForbiddenException('You cannot insert this word'),
      );

      await expect(controller.insertWord(dto, mockRequest)).rejects.toThrow(
        ForbiddenException,
      );

      expect(mockWordService.insertWord).toHaveBeenCalledWith(
        mockRequest.user.id,
        dto,
      );
    });
  });

  describe('search', () => {
    const mockRequest = {
      user: {
        id: 1,
      },
    };

    const dto: SearchWordDto = {
      query: 'test',
      languageId: 1,
      pageNo: 1,
      pageSize: 20,
    };

    const mockWordResponse: WordResponseDto = {
      id: 1,
      name: 'test',
      meaning: 'A test word',
      languageId: 1,
      userId: 1,
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

    it('should search words and return paging response', async () => {
      mockWordService.search.mockResolvedValue(mockPagingResponse);

      const result = await controller.search(dto, mockRequest);

      expect(mockWordService.search).toHaveBeenCalledWith(
        mockRequest.user.id,
        dto,
      );
      expect(result).toEqual(mockPagingResponse);
    });

    it('should throw an error if service fails', async () => {
      mockWordService.search.mockRejectedValue(
        new BadRequestException('Invalid search parameters'),
      );

      await expect(controller.search(dto, mockRequest)).rejects.toThrow(
        BadRequestException,
      );

      expect(mockWordService.search).toHaveBeenCalledWith(
        mockRequest.user.id,
        dto,
      );
    });
  });

  describe('getWord', () => {
    const mockRequest = {
      user: {
        id: 1,
      },
    };

    const mockWordResponse: WordResponseDto = {
      id: 1,
      name: 'test',
      meaning: 'A test word',
      languageId: 1,
      userId: 1,
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

    it('should get a word by id and return it', async () => {
      mockWordService.getWord.mockResolvedValue(mockWordResponse);

      const result = await controller.getWord('1', mockRequest);

      expect(mockWordService.getWord).toHaveBeenCalledWith(
        mockRequest.user.id,
        1,
      );
      expect(result).toEqual(mockWordResponse);
    });

    it('should throw BadRequestException for invalid word id', async () => {
      await expect(controller.getWord('invalid', mockRequest)).rejects.toThrow(
        BadRequestException,
      );

      expect(mockWordService.getWord).not.toHaveBeenCalled();
    });

    it('should throw an error if service fails', async () => {
      mockWordService.getWord.mockRejectedValue(
        new NotFoundException('Word not found'),
      );

      await expect(controller.getWord('1', mockRequest)).rejects.toThrow(
        NotFoundException,
      );

      expect(mockWordService.getWord).toHaveBeenCalledWith(
        mockRequest.user.id,
        1,
      );
    });
  });

  describe('updateWord', () => {
    const mockRequest = {
      user: {
        id: 1,
      },
    };

    const dto: UpdateWordDto = {
      name: 'updated test',
      meaning: 'Updated test word',
      languageId: 1,
    };

    const mockWordResponse: WordResponseDto = {
      id: 1,
      name: 'updated test',
      meaning: 'Updated test word',
      languageId: 1,
      userId: 1,
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

    it('should update a word and return it', async () => {
      mockWordService.updateWord.mockResolvedValue(mockWordResponse);

      const result = await controller.updateWord(1, dto, mockRequest);

      expect(mockWordService.updateWord).toHaveBeenCalledWith(
        mockRequest.user.id,
        1,
        dto,
      );
      expect(result).toEqual(mockWordResponse);
    });

    it('should throw an error if service fails', async () => {
      mockWordService.updateWord.mockRejectedValue(
        new NotFoundException('Word not found'),
      );

      await expect(controller.updateWord(1, dto, mockRequest)).rejects.toThrow(
        NotFoundException,
      );

      expect(mockWordService.updateWord).toHaveBeenCalledWith(
        mockRequest.user.id,
        1,
        dto,
      );
    });
  });
});
