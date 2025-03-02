import { Module } from '@nestjs/common';
import { SavedService } from './saved.service';
import { SavedController } from './saved.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Saved } from './entity/saved.entity';
import { Word } from 'src/word/entity/word.entity';
import { Comment } from 'src/comment/entity/comment.entity';
import { ContentValidator } from 'src/common/service/content-validation.service';

@Module({
  imports: [TypeOrmModule.forFeature([Saved, Word, Comment])],
  controllers: [SavedController],
  providers: [SavedService, ContentValidator],
  exports: [SavedService],
})
export class SavedModule {}
