import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Book } from './book.entity';

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  bookId: string;

  @ManyToOne(() => Book, (book) => book.questions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bookId' })
  book: Book;

  @Column({ nullable: true })
  chapterId: string; // ID главы, к которой относится вопрос

  @Column({ type: 'text' })
  questionText: string;

  @Column('simple-array')
  options: string[]; // Варианты ответов

  @Column()
  correctAnswer: string;

  @Column({ type: 'text', nullable: true })
  aiAnswer: string; // Ответ нейронки

  @Column({ default: 'medium' })
  questionLevel: string; // easy, medium, hard

  @Column({ default: true })
  isGenerated: boolean; // Сгенерирован ли нейронкой

  @CreateDateColumn()
  createdAt: Date;
}

