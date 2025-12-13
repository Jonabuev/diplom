import { IsString, IsBoolean, IsUUID } from 'class-validator';

export class AddAnswerDto {
  @IsUUID()
  bookId: string;

  @IsUUID()
  questionId: string;

  @IsString()
  userAnswer: string;

  @IsBoolean()
  isCorrect: boolean;
}



