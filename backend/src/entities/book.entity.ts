import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Question } from './question.entity';
import { History } from './history.entity';

@Entity('books')
export class Book {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  booksName: string;

  @Column({ nullable: true })
  category: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'json', default: '[]' })
  chapters: {
    id: string;
    title: string;
    content: string;
    chapterNumber: number;
  }[]; // Главы хранятся как JSON

  @Column({ default: false })
  public: boolean; // Публичная книга или нет

  @Column({ nullable: true })
  coverImage: string;

  @Column({ nullable: true })
  authorId: string; // ID создателя книги

  @OneToMany(() => Question, (question) => question.book)
  questions: Question[];

  @OneToMany(() => History, (history) => history.book)
  history: History[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

