import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from '../entities/book.entity';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private booksRepository: Repository<Book>,
  ) {}

  async create(createBookDto: any): Promise<Book> {
    const book = this.booksRepository.create(createBookDto);
    return await this.booksRepository.save(book) as Book;
  }

  async findAll(): Promise<Book[]> {
    return this.booksRepository.find();
  }

  async findPublic(): Promise<Book[]> {
    return this.booksRepository.find({
      where: { public: true },
    });
  }

  async findByCategory(category: string): Promise<Book[]> {
    return this.booksRepository.find({
      where: { category },
    });
  }

  async findByAuthor(authorId: string): Promise<Book[]> {
    return this.booksRepository.find({
      where: { authorId },
    });
  }

  async findOne(id: string): Promise<Book> {
    const book = await this.booksRepository.findOne({ where: { id } });
    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }
    return book;
  }

  async update(id: string, updateData: Partial<Book>): Promise<Book> {
    await this.booksRepository.update(id, updateData);
    return this.findOne(id);
  }

  async addChapter(
    bookId: string,
    chapter: {
      title: string;
      content: string;
      chapterNumber: number;
    },
  ): Promise<Book> {
    const book = await this.findOne(bookId);
    const chapterId = `chapter-${Date.now()}`;
    book.chapters.push({
      id: chapterId,
      ...chapter,
    });
    return this.booksRepository.save(book);
  }

  async updateChapter(
    bookId: string,
    chapterId: string,
    updateData: any,
  ): Promise<Book> {
    const book = await this.findOne(bookId);
    const chapterIndex = book.chapters.findIndex((ch) => ch.id === chapterId);
    if (chapterIndex === -1) {
      throw new NotFoundException(`Chapter with ID ${chapterId} not found`);
    }
    book.chapters[chapterIndex] = {
      ...book.chapters[chapterIndex],
      ...updateData,
    };
    return this.booksRepository.save(book);
  }

  async deleteChapter(bookId: string, chapterId: string): Promise<Book> {
    const book = await this.findOne(bookId);
    book.chapters = book.chapters.filter((ch) => ch.id !== chapterId);
    return this.booksRepository.save(book);
  }

  async togglePublic(id: string): Promise<Book> {
    const book = await this.findOne(id);
    book.public = !book.public;
    return this.booksRepository.save(book);
  }

  async remove(id: string): Promise<void> {
    const result = await this.booksRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }
  }
}

