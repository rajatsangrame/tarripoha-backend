import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { User } from './user.entity';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user-dto';
import { ApiTags } from '@nestjs/swagger';
import { SearchUserDto } from './dto/search-user-dto';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('create_user')
  async createUser(@Body() dto: CreateUserDto): Promise<User> {
    return this.userService.createUser(dto);
  }

  @Get('search')
  async search(@Query() dto: SearchUserDto): Promise<User[]> {
    return this.userService.search(dto);
  }
}
