import { Test, TestingModule } from '@nestjs/testing';
import { CommentController } from './comments.controller';
import { CommentService } from './comments.service';
import { JwtAuthGuard } from '../guard/auth/jwt.auth.guard';
import { RolesGuard } from '../guard/role/user-role.guard';
import { InsertCommentDto } from './dto/insert-comment.dto';
import { GetCommentsDto } from './dto/get-comments.dto';
import { Comment } from './entity/comment.entity';
import { PagingResponse } from '../common/interface/paging-response';
import { ContentType } from '../common/enum/content-type.enum';

describe('CommentController', () => {
  let controller: CommentController;
  let service: CommentService;

  const mockCommentService = {
    insertComment: jest.fn(),
    getComments: jest.fn(),
    deleteComment: jest.fn(),
  };

  const mockComment: Comment = {
    id: 1,
    userId: 1,
    contentId: 2,
    contentType: ContentType.WORD,
    text: 'This is a test comment',
    createdAt: new Date(),
    updatedAt: new Date(),
    user: null,
  };

  const mockPagingResponse = new PagingResponse(1, 1, 20, [mockComment]);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentController],
      providers: [
        {
          provide: CommentService,
          useValue: mockCommentService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .overrideGuard(RolesGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .compile();

    controller = module.get<CommentController>(CommentController);
    service = module.get<CommentService>(CommentService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('insertComment', () => {
    it('should call service.insertComment and return the result', async () => {
      const dto: InsertCommentDto = {
        contentId: 2,
        contentType: ContentType.WORD,
        text: 'This is a test comment',
      };
      const req = { user: { id: 1 } };
      mockCommentService.insertComment.mockResolvedValue(mockComment);

      const result = await controller.insertComment(dto, req);

      expect(service.insertComment).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(mockComment);
    });
  });

  describe('getComments', () => {
    it('should call service.getComments and return the result', async () => {
      const dto: GetCommentsDto = {
        contentId: 2,
        contentType: ContentType.WORD,
        pageNo: 1,
      };
      const req = { user: { id: 1 } };
      mockCommentService.getComments.mockResolvedValue(mockPagingResponse);

      const result = await controller.getComments(dto, req);

      expect(service.getComments).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(mockPagingResponse);
    });
  });

  describe('deleteComment', () => {
    it('should call service.deleteComment and return the result', async () => {
      const commentId = 1;
      const req = { user: { id: 1 } };
      const expectedResult = { sucess: true };
      mockCommentService.deleteComment.mockResolvedValue(expectedResult);

      const result = await controller.deleteComment(commentId, req);

      expect(service.deleteComment).toHaveBeenCalledWith(1, commentId);
      expect(result).toEqual(expectedResult);
    });
  });
});
