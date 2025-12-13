import { IsString, IsArray, IsBoolean, IsOptional, IsUUID, IsIn } from 'class-validator';

export class CreateQuestionDto {
  @IsUUID()
  bookId: string;

  @IsUUID()
  @IsOptional()
  chapterId?: string;

  @IsString()
  questionText: string;

  @IsArray()
  @IsString({ each: true })
  options: string[];

  @IsString()
  correctAnswer: string;

  @IsString()
  @IsOptional()
  aiAnswer?: string;

  @IsString()
  @IsIn(['easy', 'medium', 'hard'])
  @IsOptional()
  questionLevel?: string;

  @IsBoolean()
  @IsOptional()
  isGenerated?: boolean;
}



