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
import { CommentService } from './comments.service';
import { JwtAuthGuard } from '../guard/auth/jwt.auth.guard';
import { RolesGuard } from '../guard/role/user-role.guard';
import { USER_ROLE } from '../guard/role/user-role.enum';
import { Roles } from '../guard/role/roles.decorator';
import { InsertCommentDto } from './dto/insert-comment.dto';
import { Comment } from './entity/comment.entity';
import { GetCommentsDto } from './dto/get-comments.dto';
import { PagingResponse } from 'src/common/interface/paging-response';

@Controller('comments')
@ApiTags('Comments')
export class CommentController {
  constructor(private commentService: CommentService) {}

  @Post()
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

  @Get(':contentType/:contentId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(USER_ROLE.USER)
  async getComments(@Param() dto: GetCommentsDto, @Request() req) {
    const userId = req.user.id;
    return this.commentService.getComments(userId, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(USER_ROLE.USER)
  async deleteComment(@Param('id') id: number, @Request() req) {
    const userId = req.user.id;
    return this.commentService.deleteComment(userId, id);
  }
  
}
