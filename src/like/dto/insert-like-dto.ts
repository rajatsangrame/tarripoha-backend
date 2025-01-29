import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsEnum } from 'class-validator';
import { ContentType } from '../../common/enum/content-type.enum';

export class InsertLikeDto {
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
