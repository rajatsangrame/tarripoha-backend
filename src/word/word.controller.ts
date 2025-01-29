import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { WordService } from './word.service';
import { Word } from './entity/word.entity';
import { InsertWordDto } from './dto/insert-word-dto';
import { JwtAuthGuard } from '../guard/auth/jwt.auth.guard';
import { RolesGuard } from '../guard/role/user-role.guard';
import { USER_ROLE } from '../guard/role/user-role.enum';
import { Roles } from '../guard/role/roles.decorator';

@Controller('word')
@ApiTags('Word')
export class WordController {
  constructor(private wordService: WordService) {}

  @Post('insert-word')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(USER_ROLE.USER)
  async insertWord(@Body() dto: InsertWordDto, @Request() req): Promise<Word> {
    const userId = req.user.id;
    return this.wordService.insertWord(userId, dto);
  }
}
