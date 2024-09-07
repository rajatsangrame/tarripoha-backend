import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { NestJsTypeOrmModule } from './common/modules/typeorm/typeorm.module';

@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`env/${process.env.NODE_ENV}.env`],
    }),
    AuthModule,
    NestJsTypeOrmModule,
    UserModule,
  ],
})
export class AppModule {}
