import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { LocalAuthGuard } from 'src/guard/auth/local.auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(@Request() req, @Body() loginDto: LoginUserDto) {
    return this.authService.login(req.user);
  }
}
