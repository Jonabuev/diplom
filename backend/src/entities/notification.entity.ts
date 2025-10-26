import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string; // Получатель уведомления

  @Column()
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ default: 'info' })
  type: string; // info, success, warning, error

  @Column({ default: false })
  isRead: boolean;

  @Column({ nullable: true })
  link: string; // Ссылка для перехода

  @CreateDateColumn()
  createdAt: Date;
}

