import { Test, TestingModule } from '@nestjs/testing';
import { CommentService } from './comments.service';
import { Repository } from 'typeorm';
import { Comment } from './entity/comment.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ContentValidator } from '../common/service/content-validation.service';
import { InsertCommentDto } from './dto/insert-comment.dto';
import { GetCommentsDto } from './dto/get-comments.dto';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ContentType } from '../common/enum/content-type.enum';
import { PagingResponse } from '../common/interface/paging-response';

describe('CommentService', () => {
  let service: CommentService;
  let commentRepository: Repository<Comment>;
  let contentValidator: ContentValidator;

  const mockCommentRepository = {
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

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
    const userId = 1;
    const dto: GetCommentsDto = {
      contentId: 2,
      contentType: ContentType.WORD,
      pageNo: 1,
      pageSize: 20,
    };
    const mockComments = [
      {
        id: 1,
        contentId: dto.contentId,
        contentType: dto.contentType,
        userId: userId,
        text: 'Comment 1',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Comment,
    ];
    const mockPagingResponse = new PagingResponse(1, 1, 20, mockComments);

    it('should return a paging response with comments', async () => {
      const mockQueryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        setParameters: jest.fn().mockReturnThis(),
        offset: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockComments),
        getCount: jest.fn().mockResolvedValue(1),
      };

      mockCommentRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getComments(userId, dto);

      expect(mockQueryBuilder.leftJoin).toHaveBeenCalled();
      expect(mockQueryBuilder.select).toHaveBeenCalled();
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'comment.content_id = :contentId',
        { contentId: dto.contentId },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'comment.content_type = :type',
        { type: dto.contentType },
      );
      expect(mockQueryBuilder.offset).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(dto.pageSize);
      expect(result).toBeInstanceOf(PagingResponse);
      expect(result.total).toBe(1);
      expect(result.data).toEqual(mockComments);
    });
  });

  describe('deleteComment', () => {
    const userId = 1;
    const commentId = 1;
    const mockComment = {
      id: commentId,
      userId: userId,
      text: 'Test comment',
      contentId: 2,
      contentType: ContentType.WORD,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Comment;

    it('should delete a comment if user owns it', async () => {
      mockCommentRepository.findOne.mockResolvedValue(mockComment);
      mockCommentRepository.remove.mockResolvedValue(mockComment);

      const result = await service.deleteComment(userId, commentId);

      expect(commentRepository.findOne).toHaveBeenCalledWith({
        where: { id: commentId },
      });
      expect(commentRepository.remove).toHaveBeenCalledWith(mockComment);
      expect(result).toEqual({ sucess: true });
    });

    it('should throw NotFoundException if comment does not exist', async () => {
      mockCommentRepository.findOne.mockResolvedValue(null);

      await expect(service.deleteComment(userId, commentId)).rejects.toThrow(
        NotFoundException,
      );

      expect(commentRepository.findOne).toHaveBeenCalledWith({
        where: { id: commentId },
      });
      expect(commentRepository.remove).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user does not own the comment', async () => {
      const differentUserId = 2;
      mockCommentRepository.findOne.mockResolvedValue(mockComment);

      await expect(service.deleteComment(differentUserId, commentId)).rejects.toThrow(
        ForbiddenException,
      );

      expect(commentRepository.findOne).toHaveBeenCalledWith({
        where: { id: commentId },
      });
      expect(commentRepository.remove).not.toHaveBeenCalled();
    });
  });
});
