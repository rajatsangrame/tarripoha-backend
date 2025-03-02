import { Test, TestingModule } from '@nestjs/testing';
import { SavedController } from './saved.controller';
import { SavedService } from './saved.service';
import { JwtAuthGuard } from '../guard/auth/jwt.auth.guard';
import { RolesGuard } from '../guard/role/user-role.guard';
import { InsertSavedDto } from './dto/insert-saved-dto';
import { GetSavedDto } from './dto/get-saved-dto';
import { USER_ROLE } from '../guard/role/user-role.enum';
import { Saved } from './entity/saved.entity';
import { ContentType } from '../common/enum/content-type.enum';

const mockUserId = 123;
const mocksavedResult: Saved = {
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

describe('SavedController', () => {
  let controller: SavedController;
  let savedService: SavedService;

  const mocksavedService = {
    insertSaved: jest.fn(),
    getSaved: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SavedController],
      providers: [{ provide: SavedService, useValue: mocksavedService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<SavedController>(SavedController);
    savedService = module.get<SavedService>(SavedService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(savedService).toBeDefined();
  });

  describe('insertsaved', () => {
    it('should call savedService.insertsaved and return the result', async () => {
      const mockDto: InsertSavedDto = {
        contentId: 1,
        contentType: ContentType.WORD,
        isActive: true,
      };

      mocksavedService.insertSaved.mockResolvedValue(mocksavedResult);

      const req = { user: { id: mockUserId } };
      const result = await controller.insertSaved(mockDto, req);

      expect(result).toEqual(mocksavedResult);
      expect(mocksavedService.insertSaved).toHaveBeenCalledWith(
        mockUserId,
        mockDto,
      );
    });
  });

  describe('getsaveds', () => {
    it('should call savedService.getsaved and return the result', async () => {
      const mockDto: GetSavedDto = {
        contentType: ContentType.WORD,
        userId: mockUserId,
      };
      const mockResult = [
        {
          id: 1,
          userId: 123,
          contentId: 1234,
          contentType: mockDto.contentType,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ] as Saved[];

      mocksavedService.getSaved.mockResolvedValue(mockResult);

      const result = await controller.getSaved(mockDto);

      expect(result).toEqual(mockResult);
      expect(mocksavedService.getSaved).toHaveBeenCalledWith(mockDto);
    });
  });
});
