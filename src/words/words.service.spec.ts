import { Test, TestingModule } from '@nestjs/testing';
import { WordService } from './words.service';
import { Repository } from 'typeorm';
import { Word } from './entity/word.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InsertWordDto } from './dto/insert-word.dto';
import { BadRequestException } from '@nestjs/common';

const mockWordRepository = {
  create: jest.fn(),
  save: jest.fn(),
};

describe('WordService', () => {
  let service: WordService;
  let wordRepository: Repository<Word>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WordService,
        {
          provide: getRepositoryToken(Word),
          useValue: mockWordRepository,
        },
      ],
    }).compile();

    service = module.get<WordService>(WordService);
    wordRepository = module.get<Repository<Word>>(getRepositoryToken(Word));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('insertWord', () => {
    it('should insert a word and return it', async () => {
      const userId = 1;
      const dto: InsertWordDto = {
        name: 'test',
        meaning: 'A test word',
        languageId: 1,
      };
      const wordEntity: Word = {
        id: 1,
        name: 'test',
        meaning: 'A test word',
        userId,
      } as Word;

      mockWordRepository.create.mockReturnValue(wordEntity);
      mockWordRepository.save.mockResolvedValue(wordEntity);

      const result = await service.insertWord(userId, dto);

      expect(wordRepository.create).toHaveBeenCalledWith({ ...dto, userId });
      expect(wordRepository.save).toHaveBeenCalledWith(wordEntity);
      expect(result).toEqual(wordEntity);
    });

    it('should throw BadRequestException if word already exists', async () => {
      const userId = 1;
      const dto: InsertWordDto = {
        name: 'test',
        meaning: 'A test word',
        languageId: 1,
      };

      const error = {
        code: '23505',
      };

      mockWordRepository.create.mockReturnValue({});
      mockWordRepository.save.mockRejectedValue(error);

      await expect(service.insertWord(userId, dto)).rejects.toThrow(
        BadRequestException,
      );

      expect(wordRepository.create).toHaveBeenCalledWith({ ...dto, userId });
      expect(wordRepository.save).toHaveBeenCalled();
    });

    it('should throw the original error if it is not a unique violation', async () => {
      const userId = 1;
      const dto: InsertWordDto = {
        name: 'test',
        meaning: 'A test word',
        languageId: 1,
      };

      const error = new Error('Some other error');

      mockWordRepository.create.mockReturnValue({});
      mockWordRepository.save.mockRejectedValue(error);

      await expect(service.insertWord(userId, dto)).rejects.toThrow(error);

      expect(wordRepository.create).toHaveBeenCalledWith({ ...dto, userId });
      expect(wordRepository.save).toHaveBeenCalled();
    });
  });
});
