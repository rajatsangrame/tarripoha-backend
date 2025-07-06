import { Test, TestingModule } from '@nestjs/testing';
import { LikeController } from './likes.controller';
import { LikeService } from './likes.service';
import { JwtAuthGuard } from '../guard/auth/jwt.auth.guard';
import { RolesGuard } from '../guard/role/user-role.guard';
import { USER_ROLE } from '../guard/role/user-role.enum';
import { Like } from './entity/like.entity';
import { LikeDto } from './dto/like.dto';
import { LikeResponseDto } from './dto/like-response.dto';
import { ContentType } from '../common/enum/content-type.enum';

const mockUserId = 123;
const mockLikeResult: Like = {
  id: 1,
  userId: mockUserId,
  contentId: 456,
  contentType: ContentType.WORD,
  createdAt: new Date(),
  user: {
    id: mockUserId,
    firstName: 'John',
    lastName: 'Doe',
    password: 'hashed_password',
    email: 'john.doe@example.com',
    username: 'johndoe',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    roles: [USER_ROLE.USER],
  },
};

const mockLikeResponse: LikeResponseDto = new LikeResponseDto(5);

describe('LikeController', () => {
  let controller: LikeController;
  let likeService: LikeService;

  const mockLikeService = {
    insertLike: jest.fn(),
    getLikes: jest.fn(),
    deleteLike: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LikeController],
      providers: [{ provide: LikeService, useValue: mockLikeService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<LikeController>(LikeController);
    likeService = module.get<LikeService>(LikeService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(likeService).toBeDefined();
  });

  describe('insertLike', () => {
    it('should call likeService.insertLike and return the result', async () => {
      const mockDto: LikeDto = {
        contentId: 1,
        contentType: ContentType.WORD,
      };

      mockLikeService.insertLike.mockResolvedValue(mockLikeResponse);

      const req = { user: { id: mockUserId } };
      const result = await controller.insertLike(mockDto, req);

      expect(result).toEqual(mockLikeResponse);
      expect(mockLikeService.insertLike).toHaveBeenCalledWith(
        mockUserId,
        mockDto,
      );
    });
  });

  describe('getLikes', () => {
    it('should call likeService.getLikes and return the result', async () => {
      const mockDto: LikeDto = {
        contentId: 1,
        contentType: ContentType.WORD,
      };
      const mockResult = [
        {
          id: 1,
          userId: 123,
          contentId: mockDto.contentId,
          contentType: mockDto.contentType,
          createdAt: new Date(),
        },
      ] as Like[];

      mockLikeService.getLikes.mockResolvedValue(mockResult);

      const result = await controller.getLikes(mockDto);

      expect(result).toEqual(mockResult);
      expect(mockLikeService.getLikes).toHaveBeenCalledWith(mockDto);
    });
  });

  describe('getUserLikes', () => {
    it('should call likeService.getLikes with userId and return the result', async () => {
      const mockDto: LikeDto = {
        contentId: 1,
        contentType: ContentType.WORD,
      };
      const mockResult = [
        {
          id: 1,
          userId: mockUserId,
          contentId: mockDto.contentId,
          contentType: mockDto.contentType,
          createdAt: new Date(),
        },
      ] as Like[];

      mockLikeService.getLikes.mockResolvedValue(mockResult);

      const req = { user: { id: mockUserId } };
      const result = await controller.getUserLikes(mockDto, req);

      expect(result).toEqual(mockResult);
      expect(mockLikeService.getLikes).toHaveBeenCalledWith(mockDto, mockUserId);
    });
  });

  describe('deleteLike', () => {
    it('should call likeService.deleteLike and return the result', async () => {
      const mockDto: LikeDto = {
        contentId: 1,
        contentType: ContentType.WORD,
      };

      mockLikeService.deleteLike.mockResolvedValue(mockLikeResponse);

      const req = { user: { id: mockUserId } };
      const result = await controller.deleteLike(mockDto, req);

      expect(result).toEqual(mockLikeResponse);
      expect(mockLikeService.deleteLike).toHaveBeenCalledWith(
        mockUserId,
        mockDto,
      );
    });
  });
});
