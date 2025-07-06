import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsEnum } from 'class-validator';

export class SavedWordDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  wordId: number;
} 