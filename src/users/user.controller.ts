import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { User } from './entity/user.entity';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SearchUserDto } from './dto/search-user.dto';
import { JwtAuthGuard } from '../guard/auth/jwt.auth.guard';
import { UserMappingDto } from './dto/user-mapping.dto';
import { UserRoleMapping } from './entity/user-mappping.entity';
import { RolesGuard } from '../guard/role/user-role.guard';
import { USER_ROLE } from '../guard/role/user-role.enum';
import { Roles } from '../guard/role/roles.decorator';

@ApiTags('Users')
@Controller('users')
@UseInterceptors(ClassSerializerInterceptor) // Eexclude password from user response
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(@Body() dto: CreateUserDto): Promise<User> {
    return this.userService.createUser(dto);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async search(@Query() dto: SearchUserDto): Promise<User[]> {
    return this.userService.search(dto);
  }

  @Post('mapping')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(USER_ROLE.ADMIN)
  async createUserMapping(
    @Body() dto: UserMappingDto,
  ): Promise<UserRoleMapping> {
    return this.userService.createUserMapping(dto);
  }

  @Patch('mapping')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(USER_ROLE.ADMIN)
  async updatedUserMapping(
    @Body() dto: UserMappingDto,
  ): Promise<{ success: boolean }> {
    return this.userService.updatedUserMapping(dto);
  }
}
