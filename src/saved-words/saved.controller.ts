import { SavedService } from './saved.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guard/auth/jwt.auth.guard';
import { RolesGuard } from '../guard/role/user-role.guard';
import { USER_ROLE } from '../guard/role/user-role.enum';
import { Roles } from '../guard/role/roles.decorator';
import { SavedWordDto } from './dto/saved-word.dto';
import { SavedResponseDto } from './dto/saved-word-response.dto';
import { PagingResponse } from 'src/common/interface/paging-response';
import { WordResponseDto } from 'src/words/dto/words-response.dto';
import { GetSavedWordDto } from './dto/get-saved-word.dto';

@Controller('saved-words')
@ApiTags('Saved Words')
export class SavedController {
  constructor(private savedService: SavedService) { }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(USER_ROLE.USER)
  async insertSavedWord(
    @Body() dto: SavedWordDto,
    @Request() req,
  ): Promise<SavedResponseDto> {
    const userId = req.user.id;
    return this.savedService.insertSavedWord(userId, dto);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(USER_ROLE.USER)
  getSavedWords(
    @Param() params: GetSavedWordDto,
    @Request() req,
  ): Promise<PagingResponse<WordResponseDto>> {
    const userId = req.user.id;
    return this.savedService.getSavedWords(userId, params);
  }

  @Delete(':wordId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(USER_ROLE.USER)
  async deleteSavedWord(
    @Param() params: SavedWordDto,
    @Request() req,
  ): Promise<SavedResponseDto> {
    const userId = req.user.id;
    return this.savedService.deleteSavedWord(userId, params);
  }
}
