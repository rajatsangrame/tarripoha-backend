import { Test, TestingModule } from '@nestjs/testing';
import { CommentService } from './comment.service';
import { Repository } from 'typeorm';
import { Comment } from './entity/comment.entity';
import { Word } from '../words/entity/word.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ContentValidator } from '../common/service/content-validation.service';
import { InsertCommentDto } from './dto/insert-comment.dto';
import { GetCommentsDto } from './dto/get-comments.dto';
import { BadRequestException } from '@nestjs/common';
import { ContentType } from '../common/enum/content-type.enum';

describe('CommentService', () => {
  let service: CommentService;
  let commentRepository: Repository<Comment>;
  let contentValidator: ContentValidator;

  const mockCommentRepository = {
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockWordRepository = {};

  const mockContentValidator = {
    validateContent: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentService,
        {
          provide: getRepositoryToken(Comment),
          useValue: mockCommentRepository,
        },
        {
          provide: getRepositoryToken(Word),
          useValue: mockWordRepository,
        },
        {
          provide: ContentValidator,
          useValue: mockContentValidator,
        },
      ],
    }).compile();

    service = module.get<CommentService>(CommentService);
    commentRepository = module.get<Repository<Comment>>(
      getRepositoryToken(Comment),
    );
    contentValidator = module.get<ContentValidator>(ContentValidator);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('insertComment', () => {
    const userId = 1;
    const dto: InsertCommentDto = {
      contentId: 2,
      contentType: ContentType.WORD,
      text: 'This is a test comment.',
    };
    const mockComment = {
      id: 1,
      userId,
      ...dto,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Comment;

    it('should insert a comment if content is valid', async () => {
      mockContentValidator.validateContent.mockResolvedValue({ isValid: true });
      mockCommentRepository.create.mockReturnValue(mockComment);
      mockCommentRepository.save.mockResolvedValue(mockComment);

      const result = await service.insertComment(userId, dto);

      expect(contentValidator.validateContent).toHaveBeenCalledWith(
        dto.contentType,
        dto.contentId,
      );
      expect(commentRepository.create).toHaveBeenCalledWith({
        ...dto,
        userId,
      });
      expect(commentRepository.save).toHaveBeenCalledWith(mockComment);
      expect(result).toEqual(mockComment);
    });

    it('should throw BadRequestException if content is invalid', async () => {
      // Clear all the call history of mocks but keeps the mocked implementation.
      // This is needed call we have toHaveBeenCalled above and the state should be reset.
      jest.clearAllMocks();

      mockContentValidator.validateContent.mockResolvedValue({
        isValid: false,
        message: 'Content does not exists.',
      });

      await expect(service.insertComment(userId, dto)).rejects.toThrow(
        BadRequestException,
      );

      expect(contentValidator.validateContent).toHaveBeenCalledWith(
        dto.contentType,
        dto.contentId,
      );
      expect(commentRepository.create).not.toHaveBeenCalled();
      expect(commentRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('getComments', () => {
    const dto: GetCommentsDto = {
      contentId: 2,
      contentType: ContentType.WORD,
      userId: 1,
    };
    const mockComments: Comment[] = [
      {
        id: 1,
        contentId: dto.contentId,
        contentType: dto.contentType,
        userId: dto.userId,
        text: 'Comment 1',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Comment,
    ];
    const mockQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(mockComments),
    };

    it('should return a list of comments', async () => {
      mockCommentRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

      const result = await service.getComments(dto);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'comment.contentId = :contentId',
        { contentId: dto.contentId },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'comment.contentType = :contentType',
        { contentType: dto.contentType },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'comment.isActive = :isActive',
        { isActive: true },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'comment.userId = :userId',
        { userId: dto.userId },
      );
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
      expect(result).toEqual(mockComments);
    });
  });
});
