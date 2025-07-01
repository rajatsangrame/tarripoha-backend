import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { Comment } from './entity/comment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentController } from './comment.controller';
import { Word } from 'src/words/entity/word.entity';
import { ContentValidator } from 'src/common/service/content-validation.service';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, Word])],
  controllers: [CommentController],
  providers: [CommentService, ContentValidator],
  exports: [CommentService],
})
export class CommentModule {}
