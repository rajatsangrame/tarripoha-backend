import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';

export class SearchUserDto {
  @IsString()
  @IsNotEmpty({ message: 'Query is a required field' })
  @ApiProperty()
  query: string;

  @IsOptional()
  @IsInt({ message: 'page must be an integer' })
  @Min(1, { message: 'page must be at least 1' })
  @ApiPropertyOptional()
  page: number = 1;

  @IsOptional()
  @IsInt({ message: 'page size must be an integer' })
  @Min(10, { message: 'page size must be at least 10' })
  @ApiPropertyOptional()
  size: number = 10;
}
