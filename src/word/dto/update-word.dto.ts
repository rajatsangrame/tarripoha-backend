import { IsOptional } from 'class-validator';

export class UpdateWordDto {
  @IsOptional()
  name?: string;

  @IsOptional()
  meaning?: string;

  @IsOptional()
  englishMeaning?: string;

  @IsOptional()
  languageId: number;

  @IsOptional()
  description?: string;

  @IsOptional()
  tags?: string;

  @IsOptional()
  isActive?: boolean;
}
