import { IsString, IsOptional, IsInt, Min } from 'class-validator';

export class CreateCountryDto {
  @IsString()
  name: string;

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
