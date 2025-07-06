import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsEnum, IsBoolean } from 'class-validator';
import { ContentType } from '../../common/enum/content-type.enum';

export class InsertSavedDto {
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

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty()
  isActive: boolean;
}
