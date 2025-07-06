import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Like } from './entity/like.entity';
import { LikeDto } from './dto/like.dto';
import { ContentValidator } from '../common/service/content-validation.service';
import { LikeResponseDto } from './dto/like-response.dto';

@Injectable()
export class LikeService {
  constructor(
    @InjectRepository(Like) private likeRepository: Repository<Like>,
    private readonly contentValidator: ContentValidator,
  ) { }

  async insertLike(
    userId: number,
    dto: LikeDto,
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
      await this.likeRepository.upsert(like, {
        conflictPaths: ['userId', 'contentId', 'contentType'],
      });
      const totalLikes = await this.likeRepository.countBy({
        contentType,
        contentId,
      });
      const likeResponse = new LikeResponseDto(
        totalLikes,
      );
      return likeResponse;
    } catch (error) {
      throw error;
    }
  }

  async getLikes(dto: LikeDto, userId?: number): Promise<Like[]> {
    try {
      const queryBuilder = this.likeRepository.createQueryBuilder('like');

      queryBuilder.where('like.contentId = :contentId', {
        contentId: dto.contentId,
      });
      queryBuilder.andWhere('like.contentType = :contentType', {
        contentType: dto.contentType,
      });

      if (userId) {
        queryBuilder.andWhere('like.userId = :userId', {
          userId,
        });
      }
      const likes = await queryBuilder.getMany();
      return likes;
    } catch (error) {
      throw error;
    }
  }

  async deleteLike(
    userId: number,
    dto: LikeDto,
  ): Promise<LikeResponseDto> {
    try {
      const { contentType, contentId } = dto;
      
      // Check if the like exists
      const existingLike = await this.likeRepository.findOne({
        where: {
          userId,
          contentId,
          contentType,
        },
      });

      if (!existingLike) {
        throw new NotFoundException('Like not found');
      }

      // Delete the like
      await this.likeRepository.remove(existingLike);

      // Get updated total likes count
      const totalLikes = await this.likeRepository.countBy({
        contentType,
        contentId,
      });

      const likeResponse = new LikeResponseDto(
        totalLikes,
      );
      return likeResponse;
    } catch (error) {
      throw error;
    }
  }
}
