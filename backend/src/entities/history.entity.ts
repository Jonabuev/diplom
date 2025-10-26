import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Book } from './book.entity';

@Entity('history')
export class History {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.history, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  bookId: string;

  @ManyToOne(() => Book, (book) => book.history, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bookId' })
  book: Book;

  @Column({ nullable: true })
  questionId: string; // ID вопроса

  @Column({ type: 'int', default: 0 })
  correctAnswers: number; // Количество правильных ответов

  @Column({ type: 'int', default: 0 })
  totalQuestions: number; // Общее количество вопросов

  @Column({ type: 'json', nullable: true })
  answersDetails: {
    questionId: string;
    userAnswer: string;
    isCorrect: boolean;
    timestamp: Date;
  }[]; // Детали ответов

  @CreateDateColumn()
  createdAt: Date;
}

