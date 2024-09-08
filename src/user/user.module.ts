import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './entitity/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { JwtStrategy } from 'src/guard/auth/jwt.strategy';
import { UserRole } from './entitity/user-role.entity';
import { UserRoleMapping } from './entitity/user-mappping.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([UserRole]),
    TypeOrmModule.forFeature([UserRoleMapping]),
  ],
  providers: [UserService, JwtStrategy],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
