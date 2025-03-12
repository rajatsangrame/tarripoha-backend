import { LikeService } from './like.service';
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

@Controller('like')
@ApiTags('Like')
export class LikeController {
  constructor(private likeService: LikeService) {}

  @Post('insert-like')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(USER_ROLE.USER)
  async insertLike(@Body() dto: InsertLikeDto, @Request() req): Promise<Like> {
    const userId = req.user.id;
    return this.likeService.insertLike(userId, dto);
  }

  @Get('get-likes')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(USER_ROLE.USER)
  async getLikes(@Query() dto: GetLikesDto): Promise<Like[]> {
    return this.likeService.getLikes(dto);
  }
}
