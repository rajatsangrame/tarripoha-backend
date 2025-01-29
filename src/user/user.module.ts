import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './entity/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { JwtStrategy } from 'src/guard/auth/jwt.strategy';
import { UserRole } from './entity/user-role.entity';
import { UserRoleMapping } from './entity/user-mappping.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserRole, UserRoleMapping])],
  providers: [UserService, JwtStrategy],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
