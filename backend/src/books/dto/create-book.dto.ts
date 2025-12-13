import { IsString, IsBoolean, IsOptional, IsUUID } from 'class-validator';

export class CreateBookDto {
  @IsString()
  booksName: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  coverImage?: string;

  @IsBoolean()
  @IsOptional()
  public?: boolean;

  @IsUUID()
  @IsOptional()
  authorId?: string;
}



