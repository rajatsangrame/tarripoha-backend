import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/user/entitity/user.entity';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcryptjs';
import { UserRoleMapping } from 'src/user/entitity/user-mappping.entity';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UserService,
  ) {}
  async validateUser(username: string, password: string): Promise<User> {
    const user = await this.usersService.findUserBy({ username }, { password });
    if (user) {
      const match = await bcrypt.compare(password, user.password);
      if (match) return user;
    }
    return null;
  }

  async getUserRoles(userId: number): Promise<UserRoleMapping[]> {
    return await this.usersService.getUserRoles(userId);
  }

  async login(user: User) {
    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.roles,
    };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
