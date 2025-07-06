import { Test, TestingModule } from '@nestjs/testing';
import { SavedController } from './saved.controller';
import { SavedService } from './saved.service';
import { JwtAuthGuard } from '../guard/auth/jwt.auth.guard';
import { RolesGuard } from '../guard/role/user-role.guard';
import { USER_ROLE } from '../guard/role/user-role.enum';
import { SavedWord } from './entity/saved-word.entity';
import { ContentType } from '../common/enum/content-type.enum';
import { SavedWordDto } from './dto/saved-word.dto';

const mockUserId = 123;
const mocksavedResult: SavedWord = {
  id: 1,
  userId: mockUserId,
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
      const mockDto: SavedWordDto = {
        contentId: 1,
        contentType: ContentType.WORD,
      };

      mocksavedService.insertSaved.mockResolvedValue(mocksavedResult);

      const req = { user: { id: mockUserId } };
      const result = await controller.insertSavedWord(mockDto, req);

      expect(result).toEqual(mocksavedResult);
      expect(mocksavedService.insertSaved).toHaveBeenCalledWith(
        mockUserId,
        mockDto,
      );
    });
  });

  describe('getsaveds', () => {
    it('should call savedService.getsaved and return the result', async () => {
      const mockDto: SavedWordDto = {
        contentType: ContentType.WORD,
        contentId: 1,
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
      ] as SavedWord[];

      mocksavedService.getSaved.mockResolvedValue(mockResult);

      const result = await controller.getSavedWords(mockDto);

      expect(result).toEqual(mockResult);
      expect(mocksavedService.getSaved).toHaveBeenCalledWith(mockDto);
    });
  });
});
