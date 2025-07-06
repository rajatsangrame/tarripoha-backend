import { LikeService } from './likes.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guard/auth/jwt.auth.guard';
import { RolesGuard } from '../guard/role/user-role.guard';
import { USER_ROLE } from '../guard/role/user-role.enum';
import { Roles } from '../guard/role/roles.decorator';
import { Like } from './entity/like.entity';
import { LikeDto } from './dto/like.dto';
import { LikeResponseDto } from './dto/like-response.dto';

@Controller('likes')
@ApiTags('Likes')
export class LikeController {
  constructor(private likeService: LikeService) { }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(USER_ROLE.USER)
  async insertLike(
    @Body() dto: LikeDto,
    @Request() req,
  ): Promise<LikeResponseDto> {
    const userId = req.user.id;
    return this.likeService.insertLike(userId, dto);
  }

  @Get(':contentType/:contentId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(USER_ROLE.USER)
  async getLikes(
    @Param() params: LikeDto): Promise<Like[]> {
    return this.likeService.getLikes(params);
  }

  @Get('self/:contentType/:contentId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(USER_ROLE.USER)
  getUserLikes(
    @Param() params: LikeDto,
    @Request() req,
  ): Promise<Like[]> {
    const userId = req.user.id;
    return this.likeService.getLikes(params, userId);
  }

  @Delete(':contentType/:contentId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(USER_ROLE.USER)
  async deleteLike(
    @Param() params: LikeDto,
    @Request() req,
  ): Promise<LikeResponseDto> {
    const userId = req.user.id;
    return this.likeService.deleteLike(userId, params);
  }
}
