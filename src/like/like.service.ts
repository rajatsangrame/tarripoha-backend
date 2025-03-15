import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Like } from './entity/like.entity';
import { InsertLikeDto } from './dto/insert-like.dto';
import { GetLikesDto } from './dto/get-likes.dto';
import { ContentValidator } from '../common/service/content-validation.service';
import { LikeResponseDto } from './dto/like-response.dto';

@Injectable()
export class LikeService {
  constructor(
    @InjectRepository(Like) private likeRepository: Repository<Like>,
    private readonly contentValidator: ContentValidator,
  ) {}

  async insertLike(
    userId: number,
    dto: InsertLikeDto,
  ): Promise<LikeResponseDto> {
    try {
      const { contentType, contentId } = dto;
      const { isValid, message } = await this.contentValidator.validateContent(
        contentType,
        contentId,
      );
      if (!isValid) {
        throw new BadRequestException(message);
      }
      const likeData = { ...dto, userId };
      const like = this.likeRepository.create(likeData);
      await this.likeRepository.upsert(likeData, {
        conflictPaths: ['userId', 'contentId', 'contentType'],
      });
      const totalLikes = await this.likeRepository.countBy({
        contentType,
        contentId,
        isActive: true,
      });
      const likeResponse = new LikeResponseDto(
        like.userId,
        like.contentId,
        like.contentType,
        totalLikes,
        like.isActive,
      );
      return likeResponse;
    } catch (error) {
      throw error;
    }
  }

  async getLikes(dto: GetLikesDto): Promise<Like[]> {
    try {
      const queryBuilder = this.likeRepository.createQueryBuilder('like');

      queryBuilder.where('like.contentId = :contentId', {
        contentId: dto.contentId,
      });
      queryBuilder.andWhere('like.contentType = :contentType', {
        contentType: dto.contentType,
      });
      queryBuilder.andWhere('like.isActive = :isActive', {
        isActive: true,
      });

      if (dto.userId) {
        queryBuilder.andWhere('like.userId = :userId', {
          userId: dto.userId,
        });
      }
      const likes = await queryBuilder.getMany();
      return likes;
    } catch (error) {
      throw error;
    }
  }
}
