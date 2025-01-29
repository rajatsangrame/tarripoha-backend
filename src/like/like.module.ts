import { Module } from '@nestjs/common';
import { LikeService } from './like.service';
import { LikeController } from './like.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Like } from './entity/like.entity';
import { Word } from 'src/word/entity/word.entity';
import { Comment } from 'src/comment/entity/comment.entity';
import { ContentValidator } from 'src/common/service/content-validation.service';

@Module({
  imports: [TypeOrmModule.forFeature([Like, Word, Comment])],
  controllers: [LikeController],
  providers: [LikeService, ContentValidator],
  exports: [LikeService],
})
export class LikeModule {}
