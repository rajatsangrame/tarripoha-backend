import { Test, TestingModule } from '@nestjs/testing';
import { ContentValidator } from './content-validation.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Word } from '../../words/entity/word.entity';
import { Comment } from '../../comments/entity/comment.entity';
import { ContentType } from '../enum/content-type.enum';

describe('ContentValidator', () => {
  let contentValidator: ContentValidator;
  let wordRepository: Repository<Word>;
  let commentRepository: Repository<Comment>;

  const mockWordRepository = {
    findOne: jest.fn(),
  };

  const mockCommentRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContentValidator,
        {
          provide: getRepositoryToken(Word),
          useValue: mockWordRepository,
        },
        {
          provide: getRepositoryToken(Comment),
          useValue: mockCommentRepository,
        },
      ],
    }).compile();

    contentValidator = module.get<ContentValidator>(ContentValidator);
    wordRepository = module.get<Repository<Word>>(getRepositoryToken(Word));
    commentRepository = module.get<Repository<Comment>>(
      getRepositoryToken(Comment),
    );
  });

  it('should be defined', () => {
    expect(contentValidator).toBeDefined();
  });

  describe('validateContent', () => {
    describe('ContentType.WORD', () => {
      it('should return isValid false if the word does not exist', async () => {
        mockWordRepository.findOne.mockResolvedValue(null);

        const result = await contentValidator.validateContent(
          ContentType.WORD,
          1,
        );

        expect(wordRepository.findOne).toHaveBeenCalledWith({
          where: { id: 1 },
        });
        expect(result).toEqual({
          isValid: false,
          message: 'Content does not exists.',
        });
      });

      it('should return isValid false if the word is not active or approved', async () => {
        mockWordRepository.findOne.mockResolvedValue({
          id: 1,
          isActive: false,
          isApproved: false,
        });

        const result = await contentValidator.validateContent(
          ContentType.WORD,
          1,
        );

        expect(result).toEqual({
          isValid: false,
          message: 'Content is not active or approved.',
        });
      });

      it('should return isValid true if the word is active and approved', async () => {
        mockWordRepository.findOne.mockResolvedValue({
          id: 1,
          isActive: true,
          isApproved: true,
        });

        const result = await contentValidator.validateContent(
          ContentType.WORD,
          1,
        );

        expect(result).toEqual({ isValid: true });
      });
    });

    describe('ContentType.COMMENT', () => {
      it('should return isValid false if the comment does not exist', async () => {
        mockCommentRepository.findOne.mockResolvedValue(null);

        const result = await contentValidator.validateContent(
          ContentType.COMMENT,
          1,
        );

        expect(commentRepository.findOne).toHaveBeenCalledWith({
          where: { id: 1 },
        });
        expect(result).toEqual({
          isValid: false,
          message: 'Content does not exists.',
        });
      });

      it('should return isValid false if the comment is not active', async () => {
        mockCommentRepository.findOne.mockResolvedValue({
          id: 1,
          isActive: false,
        });

        const result = await contentValidator.validateContent(
          ContentType.COMMENT,
          1,
        );

        expect(result).toEqual({
          isValid: false,
          message: 'Content is not active.',
        });
      });

      it('should return isValid true if the comment is active', async () => {
        mockCommentRepository.findOne.mockResolvedValue({
          id: 1,
          isActive: true,
        });

        const result = await contentValidator.validateContent(
          ContentType.COMMENT,
          1,
        );

        expect(result).toEqual({ isValid: true });
      });
    });
  });
});
