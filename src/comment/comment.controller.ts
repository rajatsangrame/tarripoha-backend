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
import { CommentService } from './comment.service';
import { JwtAuthGuard } from '../guard/auth/jwt.auth.guard';
import { RolesGuard } from '../guard/role/user-role.guard';
import { USER_ROLE } from '../guard/role/user-role.enum';
import { Roles } from '../guard/role/roles.decorator';
import { InsertCommentDto } from './dto/insert-comment-dto';
import { Comment } from './entity/comment.entity';
import { GetCommentsDto } from './dto/get-comments-dto';

@Controller('comment')
@ApiTags('Comment')
export class CommentController {
  constructor(private commentService: CommentService) {}

  @Post('insert-comment')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(USER_ROLE.USER)
  async insertComment(
    @Body() dto: InsertCommentDto,
    @Request() req,
  ): Promise<Comment> {
    const userId = req.user.id;
    return this.commentService.insertComment(userId, dto);
  }

  @Get('get-comments')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(USER_ROLE.USER)
  async getComments(@Query() dto: GetCommentsDto): Promise<Comment[]> {
    return this.commentService.getComments(dto);
  }
}
