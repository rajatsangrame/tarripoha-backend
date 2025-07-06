import { Module } from '@nestjs/common';
import { WordController } from './words.controller';
import { WordService } from './words.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Word } from './entity/word.entity';
import { User } from 'src/users/entity/user.entity';
import { UserRoleMapping } from 'src/users/entity/user-mappping.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Word, User, UserRoleMapping])],
  controllers: [WordController],
  providers: [WordService],
  exports: [WordService],
})
export class WordModule {}
