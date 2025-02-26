import { ApiProperty } from '@nestjs/swagger';
import { Word } from '../entity/word.entity';

export class SearchResponseDto {
  @ApiProperty()
  total: number;

  @ApiProperty()
  pageNo: number;

  @ApiProperty()
  pageSize: number;

  @ApiProperty({ isArray: true })
  data: Word[];

  constructor(total: number, pageNo: number, pageSize: number, data: Word[]) {
    this.total = total;
    this.pageNo = pageNo;
    this.pageSize = pageSize;
    this.data = data;
  }
}
