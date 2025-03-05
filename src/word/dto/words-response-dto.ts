import { ApiProperty } from '@nestjs/swagger';

export class WordResponse {
  @ApiProperty()
  id: number;

  @ApiProperty()
  languageId: number;

  @ApiProperty()
  userId: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  meaning: string;

  @ApiProperty({ nullable: true })
  englishMeaning: string | null;

  @ApiProperty({ nullable: true })
  description: string | null;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  isApproved: boolean;

  @ApiProperty({ default: false })
  isLiked: boolean;

  @ApiProperty({ default: false })
  isSaved: boolean;
}
