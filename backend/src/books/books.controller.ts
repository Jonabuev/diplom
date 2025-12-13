import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BooksService } from './books.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateBookDto } from './dto/create-book.dto';
import { CreateChapterDto } from './dto/create-chapter.dto';

@ApiTags('books')
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new book' })
  create(@Body() createBookDto: CreateBookDto) {
    return this.booksService.create(createBookDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all books' })
  findAll() {
    return this.booksService.findAll();
  }

  @Get('public')
  @ApiOperation({ summary: 'Get all public books' })
  findPublic() {
    return this.booksService.findPublic();
  }

  @Get('category/:category')
  @ApiOperation({ summary: 'Get books by category' })
  findByCategory(@Param('category') category: string) {
    return this.booksService.findByCategory(category);
  }

  @Get('author/:authorId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get books by author' })
  findByAuthor(@Param('authorId') authorId: string) {
    return this.booksService.findByAuthor(authorId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get book by id' })
  findOne(@Param('id') id: string) {
    return this.booksService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update book' })
  update(@Param('id') id: string, @Body() updateData: any) {
    return this.booksService.update(id, updateData);
  }

  @Post(':id/chapters')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add chapter to book' })
  addChapter(@Param('id') id: string, @Body() chapter: CreateChapterDto) {
    return this.booksService.addChapter(id, chapter);
  }

  @Patch(':id/chapters/:chapterId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update chapter' })
  updateChapter(
    @Param('id') id: string,
    @Param('chapterId') chapterId: string,
    @Body() updateData: any,
  ) {
    return this.booksService.updateChapter(id, chapterId, updateData);
  }

  @Delete(':id/chapters/:chapterId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete chapter' })
  deleteChapter(@Param('id') id: string, @Param('chapterId') chapterId: string) {
    return this.booksService.deleteChapter(id, chapterId);
  }

  @Patch(':id/toggle-public')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle book public status' })
  togglePublic(@Param('id') id: string) {
    return this.booksService.togglePublic(id);
  }

  @Get('my-books')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get books created by current user' })
  getMyBooks() {
    // TODO: Implement this method to get books by current user
    // For now, return all books
    return this.booksService.findAll();
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete book' })
  remove(@Param('id') id: string) {
    return this.booksService.remove(id);
  }
}

