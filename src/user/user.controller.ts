import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { User } from './entitity/user.entity';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user-dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SearchUserDto } from './dto/search-user-dto';
import { JwtAuthGuard } from 'src/guard/auth/jwt.auth.guard';
import { UserMappingDto } from './dto/user-mapping.dto';
import { UserRoleMapping } from './entitity/user-mappping.entity';
import { RolesGuard } from 'src/guard/role/user-role.guard';
import { USER_ROLE } from 'src/guard/role/user-role.enum';
import { Roles } from 'src/guard/role/roles.decorator';

@ApiTags('User')
@Controller('user')
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('create-user')
  async createUser(@Body() dto: CreateUserDto): Promise<User> {
    return this.userService.createUser(dto);
  }

  @Get('search')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async search(@Query() dto: SearchUserDto): Promise<User[]> {
    return this.userService.search(dto);
  }

  @Post('create-user-mapping')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(USER_ROLE.ADMIN)
  async createUserMapping(
    @Body() dto: UserMappingDto,
  ): Promise<UserRoleMapping> {
    return this.userService.createUserMapping(dto);
  }

  @Put('update-user-mapping')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(USER_ROLE.ADMIN)
  async updatedUserMapping(
    @Body() dto: UserMappingDto,
  ): Promise<{ success: boolean }> {
    return this.userService.updatedUserMapping(dto);
  }
}
