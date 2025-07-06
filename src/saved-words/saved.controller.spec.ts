import { Test, TestingModule } from '@nestjs/testing';
import { SavedController } from './saved.controller';
import { SavedService } from './saved.service';
import { JwtAuthGuard } from '../guard/auth/jwt.auth.guard';
import { RolesGuard } from '../guard/role/user-role.guard';
import { USER_ROLE } from '../guard/role/user-role.enum';
import { SavedWord } from './entity/saved-word.entity';
import { SavedWordDto } from './dto/saved-word.dto';
import { SavedResponseDto } from './dto/saved-word-response.dto';
import { GetSavedWordDto } from './dto/get-saved-word.dto';
import { PagingResponse } from 'src/common/interface/paging-response';
import { WordResponseDto } from 'src/words/dto/words-response.dto';

const mockUserId = 123;
const mockSavedResult: SavedWord = {
  id: 1,
  userId: mockUserId,
  wordId: 456,
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

const mockSavedResponse: SavedResponseDto = new SavedResponseDto(true);

describe('SavedController', () => {
  let controller: SavedController;
  let savedService: SavedService;

  const mockSavedService = {
    insertSavedWord: jest.fn(),
    getSavedWords: jest.fn(),
    deleteSavedWord: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SavedController],
      providers: [{ provide: SavedService, useValue: mockSavedService }],
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

  describe('insertSavedWord', () => {
    it('should call savedService.insertSavedWord and return the result', async () => {
      const mockDto: SavedWordDto = {
        wordId: 1,
      };

      mockSavedService.insertSavedWord.mockResolvedValue(mockSavedResponse);

      const req = { user: { id: mockUserId } };
      const result = await controller.insertSavedWord(mockDto, req);

      expect(result).toEqual(mockSavedResponse);
      expect(mockSavedService.insertSavedWord).toHaveBeenCalledWith(
        mockUserId,
        mockDto,
      );
    });
  });

  describe('getSavedWords', () => {
    it('should call savedService.getSavedWords and return the result', async () => {
      const mockDto: GetSavedWordDto = {
        pageNo: 1,
        pageSize: 10,
      };
      const mockResult = new PagingResponse<WordResponseDto>(
        1,
        1,
        10,
        [] as WordResponseDto[],
      );

      mockSavedService.getSavedWords.mockResolvedValue(mockResult);

      const req = { user: { id: mockUserId } };
      const result = await controller.getSavedWords(mockDto, req);

      expect(result).toEqual(mockResult);
      expect(mockSavedService.getSavedWords).toHaveBeenCalledWith(
        mockUserId,
        mockDto,
      );
    });
  });

  describe('deleteSavedWord', () => {
    it('should call savedService.deleteSavedWord and return the result', async () => {
      const mockDto: SavedWordDto = {
        wordId: 1,
      };

      mockSavedService.deleteSavedWord.mockResolvedValue(mockSavedResponse);

      const req = { user: { id: mockUserId } };
      const result = await controller.deleteSavedWord(mockDto, req);

      expect(result).toEqual(mockSavedResponse);
      expect(mockSavedService.deleteSavedWord).toHaveBeenCalledWith(
        mockUserId,
        mockDto,
      );
    });
  });
});
