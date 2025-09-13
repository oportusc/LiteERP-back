import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, IsOptional, IsNumber, Min } from 'class-validator';

export class UpdateCompanyDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxMembers?: number;
}
