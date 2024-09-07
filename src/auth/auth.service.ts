import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UserService,
  ) {}
  async validateUser(username: string, password: string): Promise<any> {
    // const user = { password: 'rajat189' };
    const users = await this.usersService.findAll();
    console.log('users', users);
    const user = await this.usersService.findOne(1);
    if (user?.password === password) {
      return user;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.userId };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
