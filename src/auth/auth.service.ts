import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entity/user.entity';
import { UserService } from '../users/user.service';
import * as bcrypt from 'bcryptjs';
import { UserRoleMapping } from '../users/entity/user-mappping.entity';
import { USER_ROLE } from 'src/guard/role/user-role.enum';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UserService,
  ) {}
  async validateUser(username: string, password: string): Promise<User> {
    const user = await this.usersService.findUserBy({ username }, [
      'id',
      'username',
      'password',
      'firstName',
      'lastName',
      'email',
    ]);
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

  async skip() {
    const payload = {
      firstName: "Guest",
      email: "hello@guest.com",
      roles: [
        USER_ROLE.GUEST
      ],
    };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
