import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { WordService } from './words.service';
import { Word } from './entity/word.entity';
import { InsertWordDto } from './dto/insert-word.dto';
import { JwtAuthGuard } from '../guard/auth/jwt.auth.guard';
import { RolesGuard } from '../guard/role/user-role.guard';
import { USER_ROLE } from '../guard/role/user-role.enum';
import { Roles } from '../guard/role/roles.decorator';
import { SearchWordDto } from './dto/search-word.dto';
import { PagingResponse } from 'src/common/interface/paging-response';
import { WordResponseDto } from './dto/words-response.dto';
import { UpdateWordDto } from './dto/update-word.dto';

@Controller('words')
@ApiTags('Words')
export class WordController {
  constructor(private wordService: WordService) { }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(USER_ROLE.USER)
  async insertWord(@Body() dto: InsertWordDto, @Request() req): Promise<Word> {
    const userId = req.user.id;
    return this.wordService.insertWord(userId, dto);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(USER_ROLE.USER)
  async search(
    @Query() dto: SearchWordDto,
    @Request() req,
  ): Promise<PagingResponse<WordResponseDto>> {
    const userId = req.user.id;
    return this.wordService.search(userId, dto);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(USER_ROLE.USER)
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID of the word to fetch',
  })
  async getWord(
    @Param('id') id: string,
    @Request() req,
  ): Promise<WordResponseDto> {
    const wordId = Number(id);
    if (isNaN(wordId)) {
      throw new BadRequestException('Invalid word ID');
    }
    const userId = req.user.id;
    return this.wordService.getWord(userId, wordId);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(USER_ROLE.ADMIN)
  async updateWord(
    @Param('id', ParseIntPipe) wordId: number,
    @Body() dto: UpdateWordDto,
    @Request() req,
  ): Promise<WordResponseDto> {
    const userId = req.user.id;
    return this.wordService.updateWord(userId, wordId, dto);
  }
}
