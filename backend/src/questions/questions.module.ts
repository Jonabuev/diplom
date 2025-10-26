import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionsService } from './questions.service';
import { QuestionsController } from './questions.controller';
import { Question } from '../entities/question.entity';
import { BooksModule } from '../books/books.module';

@Module({
  imports: [TypeOrmModule.forFeature([Question]), BooksModule],
  controllers: [QuestionsController],
  providers: [QuestionsService],
  exports: [QuestionsService],
})
export class QuestionsModule {}

