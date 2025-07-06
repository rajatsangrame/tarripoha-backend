import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { NestJsTypeOrmModule } from './common/modules/typeorm/typeorm.module';
import { WordModule } from './words/words.module';
import { CommentController } from './comments/comments.controller';
import { CommentModule } from './comments/comments.module';
import { LikeController } from './likes/likes.controller';
import { LikeModule } from './likes/likes.module';
import { SavedModule } from './saved-words/saved.module';
import { SavedController } from './saved-words/saved.controller';

@Module({
  controllers: [
    AppController,
    CommentController,
    LikeController,
    SavedController,
  ],
  providers: [AppService],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`env/${process.env.NODE_ENV}.env`],
    }),
    AuthModule,
    NestJsTypeOrmModule,
    UserModule,
    WordModule,
    CommentModule,
    LikeModule,
    SavedModule,
  ],
})
export class AppModule {}
