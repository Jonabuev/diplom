import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
  ) {}

  async create(createNotificationDto: any): Promise<Notification> {
    const notification =
      this.notificationsRepository.create(createNotificationDto);
    const savedNotification = await this.notificationsRepository.save(notification);
    return savedNotification;
  }

  async findByUser(userId: string): Promise<Notification[]> {
    return this.notificationsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findUnreadByUser(userId: string): Promise<Notification[]> {
    return this.notificationsRepository.find({
      where: { userId, isRead: false },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Notification> {
    const notification = await this.notificationsRepository.findOne({
      where: { id },
    });
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    return notification;
  }

  async markAsRead(id: string): Promise<Notification> {
    const notification = await this.findOne(id);
    notification.isRead = true;
    return this.notificationsRepository.save(notification);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationsRepository.update(
      { userId, isRead: false },
      { isRead: true },
    );
  }

  async remove(id: string): Promise<void> {
    const result = await this.notificationsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
  }

  async removeAllByUser(userId: string): Promise<void> {
    await this.notificationsRepository.delete({ userId });
  }

  // Вспомогательные методы для создания типовых уведомлений
  async notifyNewBook(userId: string, bookName: string): Promise<Notification> {
    return this.create({
      userId,
      title: 'Новая книга доступна!',
      message: `Книга "${bookName}" теперь доступна для изучения.`,
      type: 'info',
      link: '/books',
    });
  }

  async notifyLevelUp(userId: string, newLevel: number): Promise<Notification> {
    return this.create({
      userId,
      title: 'Поздравляем!',
      message: `Вы достигли ${newLevel} уровня!`,
      type: 'success',
      link: '/profile',
    });
  }

  async notifyQuestionGenerated(
    userId: string,
    bookName: string,
    count: number,
  ): Promise<Notification> {
    return this.create({
      userId,
      title: 'Вопросы сгенерированы',
      message: `Для книги "${bookName}" сгенерировано ${count} вопросов.`,
      type: 'success',
    });
  }
}

