import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsEnum } from 'class-validator';
import { ContentType } from '../../common/enum/content-type.enum';
import { Transform } from 'class-transformer';

export class InsertCommentDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  @Transform(({ value }) => value.trim()) // Trim whitespace from the input
  text: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  contentId: number;

  @IsNotEmpty()
  @ApiProperty({
    enum: ContentType,
  })
  @IsEnum(ContentType, {
    message: 'contentType must be a valid value',
  })
  contentType: ContentType;
}
