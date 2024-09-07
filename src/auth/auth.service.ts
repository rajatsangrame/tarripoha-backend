import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
// import { User } from 'src/users/user.entity';
// import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    // private usersService: UsersService,
  ) {}
  async validateUser(username: string, password: string): Promise<any> {
    const user = { password: 'rajat189' };
    // const user = await this.usersService.findOne(1);
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
