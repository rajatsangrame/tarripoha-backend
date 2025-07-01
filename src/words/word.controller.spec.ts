import { Test, TestingModule } from '@nestjs/testing';
import { WordController } from './word.controller';
import { WordService } from './word.service';
import { JwtAuthGuard } from '../guard/auth/jwt.auth.guard';
import { RolesGuard } from '../guard/role/user-role.guard';
import { InsertWordDto } from './dto/insert-word.dto';
import { Word } from './entity/word.entity';
import { ForbiddenException } from '@nestjs/common';

describe('WordController', () => {
  let controller: WordController;
  let service: WordService;

  const mockWordService = {
    insertWord: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WordController],
      providers: [
        {
          provide: WordService,
          useValue: mockWordService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true }) // Mocking JwtAuthGuard
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true }) // Mocking RolesGuard
      .compile();

    controller = module.get<WordController>(WordController);
    service = module.get<WordService>(WordService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('insertWord', () => {
    const mockRequest = {
      user: {
        id: 1,
      },
    };

    const dto: InsertWordDto = {
      name: 'test',
      meaning: 'A test word',
      languageId: 1,
    };

    const mockWord: Word = {
      id: 1,
      name: 'test',
      meaning: 'A test word',
      userId: mockRequest.user.id,
    } as Word;

    it('should insert a word and return it', async () => {
      mockWordService.insertWord.mockResolvedValue(mockWord);

      const result = await controller.insertWord(dto, mockRequest);

      expect(mockWordService.insertWord).toHaveBeenCalledWith(
        mockRequest.user.id,
        dto,
      );
      expect(result).toEqual(mockWord);
    });

    it('should throw an error if service fails', async () => {
      mockWordService.insertWord.mockRejectedValue(
        new ForbiddenException('You cannot insert this word'),
      );

      await expect(controller.insertWord(dto, mockRequest)).rejects.toThrow(
        ForbiddenException,
      );

      expect(mockWordService.insertWord).toHaveBeenCalledWith(
        mockRequest.user.id,
        dto,
      );
    });
  });
});
