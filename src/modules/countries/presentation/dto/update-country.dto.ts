import { IsOptional, IsString, IsInt, Min } from 'class-validator';

export class UpdateCountryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  importance?: number;

  @IsOptional()
  @IsString()
  wishes?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  quote?: string;
}