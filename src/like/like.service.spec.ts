import { Test, TestingModule } from '@nestjs/testing';
import { LikeService } from './like.service';
import { Repository } from 'typeorm';
import { Like } from './entity/like.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ContentValidator } from '../common/service/content-validation.service';
import { BadRequestException } from '@nestjs/common';
import { InsertLikeDto } from './dto/insert-like-dto';
import { GetLikesDto } from './dto/get-likes-dto';

describe('LikeService', () => {
  let service: LikeService;
  let likeRepository: Repository<Like>;
  let contentValidator: ContentValidator;

  const mockLikeRepository = {
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
        LikeService,
        {
          provide: getRepositoryToken(Like),
          useValue: mockLikeRepository,
        },
        {
          provide: ContentValidator,
          useValue: mockContentValidator,
        },
      ],
    }).compile();

    service = module.get<LikeService>(LikeService);
    likeRepository = module.get<Repository<Like>>(getRepositoryToken(Like));
    contentValidator = module.get<ContentValidator>(ContentValidator);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('insertLike', () => {
    const userId = 1;
    const insertLikeDto: InsertLikeDto = {
      contentId: 100,
      contentType: 1,
    };
    const mockLike: Like = {
      ...insertLikeDto,
      userId,
      id: 1,
    } as Like;

    it('should insert a like if the content is valid', async () => {
      mockContentValidator.validateContent.mockResolvedValueOnce({
        isValid: true,
      });
      mockLikeRepository.create.mockReturnValueOnce(mockLike);
      mockLikeRepository.save.mockResolvedValueOnce(mockLike);

      const result = await service.insertLike(userId, insertLikeDto);

      expect(contentValidator.validateContent).toHaveBeenCalledWith(
        insertLikeDto.contentType,
        insertLikeDto.contentId,
      );
      expect(likeRepository.create).toHaveBeenCalledWith({
        ...insertLikeDto,
        userId,
      });
      expect(likeRepository.save).toHaveBeenCalledWith(mockLike);
      expect(result).toEqual(mockLike);
    });

    it('should throw BadRequestException if content is invalid', async () => {
      // Clear all the call history of mocks but keeps the mocked implementation.
      // This is needed call we have toHaveBeenCalled above and the state should be reset.
      jest.clearAllMocks();

      mockContentValidator.validateContent.mockResolvedValueOnce({
        isValid: false,
        message: 'Content not found',
      });

      await expect(service.insertLike(userId, insertLikeDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(contentValidator.validateContent).toHaveBeenCalledWith(
        insertLikeDto.contentType,
        insertLikeDto.contentId,
      );
      expect(likeRepository.create).not.toHaveBeenCalled();
      expect(likeRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('getLikes', () => {
    const getLikesDto: GetLikesDto = {
      contentId: 100,
      contentType: 1,
      userId: 1,
    };

    it('should return likes matching the query', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValueOnce([
          {
            id: 1,
            contentId: getLikesDto.contentId,
            contentType: getLikesDto.contentType,
            userId: getLikesDto.userId,
          },
        ]),
      };
      mockLikeRepository.createQueryBuilder.mockReturnValueOnce(
        mockQueryBuilder,
      );

      const result = await service.getLikes(getLikesDto);

      expect(mockLikeRepository.createQueryBuilder).toHaveBeenCalledWith(
        'like',
      );
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'like.contentId = :contentId',
        { contentId: getLikesDto.contentId },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'like.contentType = :contentType',
        { contentType: getLikesDto.contentType },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'like.isActive = :isActive',
        { isActive: true },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'like.userId = :userId',
        { userId: getLikesDto.userId },
      );
      expect(result).toEqual([
        {
          id: 1,
          contentId: getLikesDto.contentId,
          contentType: getLikesDto.contentType,
          userId: getLikesDto.userId,
        },
      ]);
    });
  });
});
