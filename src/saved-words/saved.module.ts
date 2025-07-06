import { Module } from '@nestjs/common';
import { SavedService } from './saved.service';
import { SavedController } from './saved.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SavedWord } from './entity/saved-word.entity';
import { Word } from 'src/words/entity/word.entity';
import { Comment } from 'src/comments/entity/comment.entity';
import { ContentValidator } from 'src/common/service/content-validation.service';

@Module({
  imports: [TypeOrmModule.forFeature([SavedWord, Word, Comment])],
  controllers: [SavedController],
  providers: [SavedService, ContentValidator],
  exports: [SavedService],
})
export class SavedModule {}
