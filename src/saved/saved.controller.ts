import { SavedService } from './saved.service';
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
import { InsertSavedDto } from './dto/insert-saved-dto';
import { Saved } from './entity/saved.entity';
import { GetSavedDto } from './dto/get-saved-dto';
import { PagingResponse } from 'src/common/interface/paging-response';
import { WordResponseDto } from 'src/word/dto/words-response.dto';

@Controller('saved')
@ApiTags('Saved')
export class SavedController {
  constructor(private savedService: SavedService) {}

  @Post('insert-saved')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(USER_ROLE.USER)
  async insertSaved(
    @Body() dto: InsertSavedDto,
    @Request() req,
  ): Promise<Saved> {
    const userId = req.user.id;
    return this.savedService.insertSaved(userId, dto);
  }

  @Get('get-saved')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(USER_ROLE.USER)
  async getSaved(
    @Query() dto: GetSavedDto,
    @Request() req,
  ): Promise<PagingResponse<WordResponseDto>> {
    const userId = req.user.id;
    return this.savedService.getSaved(userId, dto);
  }
}
