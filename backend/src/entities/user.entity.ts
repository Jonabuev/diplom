import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { History } from './history.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ default: 1 })
  lvl: number;

  @Column('simple-array', { default: '' })
  listBooks: string[]; // Массив ID книг пользователя

  @Column({ default: 'student' })
  role: string; // student, teacher, admin

  @OneToMany(() => History, (history) => history.user)
  history: History[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

