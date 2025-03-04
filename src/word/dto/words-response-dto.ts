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

export class WordsResponseDto {
  @ApiProperty()
  total: number;

  @ApiProperty()
  pageNo: number;

  @ApiProperty()
  pageSize: number;

  @ApiProperty({ isArray: true, type: WordResponse })
  data: WordResponse[];

  constructor(
    total: number,
    pageNo: number,
    pageSize: number,
    data: WordResponse[],
  ) {
    this.total = total;
    this.pageNo = pageNo;
    this.pageSize = pageSize;
    this.data = data;
  }
}
