import { Test, TestingModule } from '@nestjs/testing';
import { LikeService } from './likes.service';
import { Repository } from 'typeorm';
import { Like } from './entity/like.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ContentValidator } from '../common/service/content-validation.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { LikeDto } from './dto/like.dto';
import { LikeResponseDto } from './dto/like-response.dto';
import { ContentType } from '../common/enum/content-type.enum';

describe('LikeService', () => {
  let service: LikeService;
  let likeRepository: Repository<Like>;
  let contentValidator: ContentValidator;

  const mockLikeRepository = {
    create: jest.fn(),
    upsert: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    countBy: jest.fn(),
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
    const insertLikeDto: LikeDto = {
      contentId: 100,
      contentType: ContentType.WORD,
    };
    const mockLike: Like = {
      ...insertLikeDto,
      userId,
      id: 1,
      createdAt: new Date(),
    } as Like;

    it('should insert a like if the content is valid', async () => {
      mockContentValidator.validateContent.mockResolvedValueOnce({
        isValid: true,
      });
      mockLikeRepository.create.mockReturnValueOnce(mockLike);
      mockLikeRepository.upsert.mockResolvedValueOnce(undefined);
      mockLikeRepository.countBy.mockResolvedValueOnce(5);

      const result = await service.insertLike(userId, insertLikeDto);

      expect(contentValidator.validateContent).toHaveBeenCalledWith(
        insertLikeDto.contentType,
        insertLikeDto.contentId,
      );
      expect(likeRepository.create).toHaveBeenCalledWith({
        ...insertLikeDto,
        userId,
      });
      expect(likeRepository.upsert).toHaveBeenCalledWith(mockLike, {
        conflictPaths: ['userId', 'contentId', 'contentType'],
      });
      expect(likeRepository.countBy).toHaveBeenCalledWith({
        contentType: insertLikeDto.contentType,
        contentId: insertLikeDto.contentId,
      });
      expect(result).toEqual(new LikeResponseDto(5));
    });

    it('should throw BadRequestException if content is invalid', async () => {
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
      expect(likeRepository.upsert).not.toHaveBeenCalled();
    });
  });

  describe('getLikes', () => {
    const getLikesDto: LikeDto = {
      contentId: 100,
      contentType: ContentType.WORD,
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
            userId: 1,
            createdAt: new Date(),
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
      expect(result).toEqual([
        {
          id: 1,
          contentId: getLikesDto.contentId,
          contentType: getLikesDto.contentType,
          userId: 1,
          createdAt: new Date(),
        },
      ]);
    });

    it('should return user-specific likes when userId is provided', async () => {
      const userId = 1;
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValueOnce([
          {
            id: 1,
            contentId: getLikesDto.contentId,
            contentType: getLikesDto.contentType,
            userId,
            createdAt: new Date(),
          },
        ]),
      };
      mockLikeRepository.createQueryBuilder.mockReturnValueOnce(
        mockQueryBuilder,
      );

      const result = await service.getLikes(getLikesDto, userId);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'like.userId = :userId',
        { userId },
      );
      expect(result).toEqual([
        {
          id: 1,
          contentId: getLikesDto.contentId,
          contentType: getLikesDto.contentType,
          userId,
          createdAt: new Date(),
        },
      ]);
    });
  });

  describe('deleteLike', () => {
    const userId = 1;
    const deleteLikeDto: LikeDto = {
      contentId: 100,
      contentType: ContentType.WORD,
    };
    const mockLike: Like = {
      ...deleteLikeDto,
      userId,
      id: 1,
      createdAt: new Date(),
    } as Like;

    it('should delete a like if it exists', async () => {
      mockLikeRepository.findOne.mockResolvedValueOnce(mockLike);
      mockLikeRepository.remove.mockResolvedValueOnce(undefined);
      mockLikeRepository.countBy.mockResolvedValueOnce(4);

      const result = await service.deleteLike(userId, deleteLikeDto);

      expect(likeRepository.findOne).toHaveBeenCalledWith({
        where: {
          userId,
          contentId: deleteLikeDto.contentId,
          contentType: deleteLikeDto.contentType,
        },
      });
      expect(likeRepository.remove).toHaveBeenCalledWith(mockLike);
      expect(likeRepository.countBy).toHaveBeenCalledWith({
        contentType: deleteLikeDto.contentType,
        contentId: deleteLikeDto.contentId,
      });
      expect(result).toEqual(new LikeResponseDto(4));
    });

    it('should throw NotFoundException if like does not exist', async () => {
      mockLikeRepository.findOne.mockResolvedValueOnce(null);

      await expect(service.deleteLike(userId, deleteLikeDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(likeRepository.findOne).toHaveBeenCalledWith({
        where: {
          userId,
          contentId: deleteLikeDto.contentId,
          contentType: deleteLikeDto.contentType,
        },
      });
      expect(likeRepository.remove).not.toHaveBeenCalled();
    });
  });
});
