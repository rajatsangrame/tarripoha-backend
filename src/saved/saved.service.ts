import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Saved } from './entity/saved.entity';
import { InsertSavedDto } from './dto/insert-saved-dto';
import { GetSavedDto } from './dto/get-saved-dto';
import { ContentValidator } from '../common/service/content-validation.service';

@Injectable()
export class SavedService {
  constructor(
    @InjectRepository(Saved) private savedRepository: Repository<Saved>,
    private readonly contentValidator: ContentValidator,
  ) {}

  async insertSaved(userId: number, dto: InsertSavedDto): Promise<Saved> {
    try {
      const { isValid, message } = await this.contentValidator.validateContent(
        dto.contentType,
        dto.contentId,
      );
      if (!isValid) {
        throw new BadRequestException(message);
      }
      const savedData = { ...dto, userId };
      const saved = this.savedRepository.create(savedData);
      await this.savedRepository.upsert(savedData, {
        conflictPaths: ['userId', 'contentId', 'contentType'],
      });
      return saved;
    } catch (error) {
      throw error;
    }
  }

  async getSaved(dto: GetSavedDto): Promise<Saved[]> {
    try {
      const queryBuilder = this.savedRepository.createQueryBuilder('saved');

      queryBuilder.andWhere('saved.contentType = :contentType', {
        contentType: dto.contentType,
      });
      queryBuilder.andWhere('saved.isActive = :isActive', {
        isActive: true,
      });

      if (dto.userId) {
        queryBuilder.andWhere('saved.userId = :userId', {
          userId: dto.userId,
        });
      }
      const saved = await queryBuilder.getMany();
      return saved;
    } catch (error) {
      throw error;
    }
  }
}
