import { LikeService } from './likes.service';
import {
  Body,
  Controller,
  Get,
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
import { InsertLikeDto } from './dto/insert-like.dto';
import { Like } from './entity/like.entity';
import { GetLikesDto } from './dto/get-likes.dto';
import { LikeResponseDto } from './dto/like-response.dto';

@Controller('likes')
@ApiTags('Likes')
export class LikeController {
  constructor(private likeService: LikeService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(USER_ROLE.USER)
  async insertLike(
    @Body() dto: InsertLikeDto,
    @Request() req,
  ): Promise<LikeResponseDto> {
    const userId = req.user.id;
    return this.likeService.insertLike(userId, dto);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(USER_ROLE.USER)
  async getLikes(@Query() dto: GetLikesDto): Promise<Like[]> {
    return this.likeService.getLikes(dto);
  }
}
