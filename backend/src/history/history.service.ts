import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { History } from '../entities/history.entity';

@Injectable()
export class HistoryService {
  constructor(
    @InjectRepository(History)
    private historyRepository: Repository<History>,
  ) {}

  async create(createHistoryDto: any): Promise<History> {
    const history = this.historyRepository.create(createHistoryDto);
    return await this.historyRepository.save(history) as unknown as History;
  }

  async findAll(): Promise<History[]> {
    return this.historyRepository.find({
      relations: ['user', 'book'],
    });
  }

  async findByUser(userId: string): Promise<History[]> {
    return this.historyRepository.find({
      where: { userId },
      relations: ['book'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByBook(bookId: string): Promise<History[]> {
    return this.historyRepository.find({
      where: { bookId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<History> {
    const history = await this.historyRepository.findOne({
      where: { id },
      relations: ['user', 'book'],
    });
    if (!history) {
      throw new NotFoundException(`History record with ID ${id} not found`);
    }
    return history;
  }

  async addAnswer(
    userId: string,
    bookId: string,
    questionId: string,
    userAnswer: string,
    isCorrect: boolean,
  ): Promise<History> {
    // Ищем существующую запись для пользователя и книги
    let history = await this.historyRepository.findOne({
      where: { userId, bookId },
    });

    if (!history) {
      // Создаем новую запись
      history = await this.create({
        userId,
        bookId,
        correctAnswers: 0,
        totalQuestions: 0,
        answersDetails: [],
      });
    }

    // Добавляем новый ответ
    history.answersDetails = history.answersDetails || [];
    history.answersDetails.push({
      questionId,
      userAnswer,
      isCorrect,
      timestamp: new Date(),
    });

    history.totalQuestions += 1;
    if (isCorrect) {
      history.correctAnswers += 1;
    }

    return this.historyRepository.save(history);
  }

  async getStatistics(userId: string, bookId?: string): Promise<any> {
    const query: any = { userId };
    if (bookId) {
      query.bookId = bookId;
    }

    const histories = await this.historyRepository.find({
      where: query,
      relations: ['book'],
    });

    const totalQuestions = histories.reduce(
      (sum, h) => sum + h.totalQuestions,
      0,
    );
    const correctAnswers = histories.reduce(
      (sum, h) => sum + h.correctAnswers,
      0,
    );
    const accuracy =
      totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

    return {
      totalQuestions,
      correctAnswers,
      incorrectAnswers: totalQuestions - correctAnswers,
      accuracy: accuracy.toFixed(2),
      booksStudied: histories.length,
      histories,
    };
  }

  async remove(id: string): Promise<void> {
    const result = await this.historyRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`History record with ID ${id} not found`);
    }
  }
}

