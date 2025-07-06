import { Test, TestingModule } from '@nestjs/testing';
import { LikeController } from './likes.controller';
import { LikeService } from './likes.service';
import { JwtAuthGuard } from '../guard/auth/jwt.auth.guard';
import { RolesGuard } from '../guard/role/user-role.guard';
import { InsertLikeDto } from './dto/like.dto';
import { GetLikesDto } from './dto/get-likes.dto';
import { USER_ROLE } from '../guard/role/user-role.enum';
import { Like } from './entity/like.entity';
import { ContentType } from '../common/enum/content-type.enum';

const mockUserId = 123;
const mockLikeResult: Like = {
  id: 1,
  userId: mockUserId,
  contentId: 456,
  contentType: ContentType.WORD,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
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

describe('LikeController', () => {
  let controller: LikeController;
  let likeService: LikeService;

  const mockLikeService = {
    insertLike: jest.fn(),
    getLikes: jest.fn(),
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
      const mockDto: InsertLikeDto = {
        contentId: 1,
        contentType: ContentType.WORD,
      };

      mockLikeService.insertLike.mockResolvedValue(mockLikeResult);

      const req = { user: { id: mockUserId } };
      const result = await controller.insertLike(mockDto, req);

      expect(result).toEqual(mockLikeResult);
      expect(mockLikeService.insertLike).toHaveBeenCalledWith(
        mockUserId,
        mockDto,
      );
    });
  });

  describe('getLikes', () => {
    it('should call likeService.getLikes and return the result', async () => {
      const mockDto: GetLikesDto = {
        contentId: 1,
        contentType: ContentType.WORD,
        userId: mockUserId,
      };
      const mockResult = [
        {
          id: 1,
          userId: 123,
          contentId: mockDto.contentId,
          contentType: mockDto.contentType,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ] as Like[];

      mockLikeService.getLikes.mockResolvedValue(mockResult);

      const result = await controller.getLikes(mockDto);

      expect(result).toEqual(mockResult);
      expect(mockLikeService.getLikes).toHaveBeenCalledWith(mockDto);
    });
  });
});
