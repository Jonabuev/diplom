import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from '../entities/question.entity';
import { BooksService } from '../books/books.service';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private questionsRepository: Repository<Question>,
    private booksService: BooksService,
  ) {}

  async create(createQuestionDto: any): Promise<Question> {
    const question = this.questionsRepository.create(createQuestionDto);
    return (await this.questionsRepository.save(question)) as unknown as Question;
  }

  async findAll(): Promise<Question[]> {
    return this.questionsRepository.find({ relations: ['book'] });
  }

  async findByBook(bookId: string): Promise<Question[]> {
    return this.questionsRepository.find({
      where: { bookId },
      relations: ['book'],
    });
  }

  async findByChapter(chapterId: string): Promise<Question[]> {
    return this.questionsRepository.find({
      where: { chapterId },
    });
  }

  async findByLevel(level: string): Promise<Question[]> {
    return this.questionsRepository.find({
      where: { questionLevel: level },
    });
  }

  async findOne(id: string): Promise<Question> {
    const question = await this.questionsRepository.findOne({
      where: { id },
      relations: ['book'],
    });
    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }
    return question;
  }

  async update(id: string, updateData: Partial<Question>): Promise<Question> {
    await this.questionsRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.questionsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }
  }

  /**
   * Генерация вопросов с помощью нейронной сети
   * TODO: Интегрировать с AI моделью
   */
  async generateQuestions(
    chapterId: string,
    bookId: string,
    count: number = 5,
  ): Promise<Question[]> {
    // Получаем книгу и главу
    const book = await this.booksService.findOne(bookId);
    const chapter = book.chapters.find((ch) => ch.id === chapterId);

    if (!chapter) {
      throw new NotFoundException(`Chapter with ID ${chapterId} not found`);
    }

    // TODO: Здесь будет интеграция с нейронной моделью
    // Например, отправка содержимого главы в AI API
    // const aiResponse = await this.aiService.generateQuestions(chapter.content, count);

    // Пока возвращаем заглушку
    const generatedQuestions: Question[] = [];
    const levels = ['easy', 'medium', 'hard'];

    for (let i = 0; i < count; i++) {
      const question = await this.create({
        bookId: book.id,
        chapterId: chapter.id,
        questionText: `Сгенерированный вопрос ${i + 1} для главы "${chapter.title}"`,
        options: ['Вариант A', 'Вариант B', 'Вариант C', 'Вариант D'],
        correctAnswer: 'Вариант A',
        aiAnswer: 'Это сгенерированное объяснение от нейронной сети',
        questionLevel: levels[i % levels.length],
        isGenerated: true,
      });
      generatedQuestions.push(question);
    }

    return generatedQuestions;
  }
}

