import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { NestJsTypeOrmModule } from './common/modules/typeorm/typeorm.module';
import { WordModule } from './word/word.module';
import { CommentController } from './comment/comment.controller';
import { CommentModule } from './comment/comment.module';
import { LikeController } from './like/like.controller';
import { LikeModule } from './like/like.module';

@Module({
  controllers: [AppController, CommentController, LikeController],
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
  ],
})
export class AppModule {}
