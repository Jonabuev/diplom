import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { QuestionsService } from './questions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateQuestionDto } from './dto/create-question.dto';

@ApiTags('questions')
@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new question' })
  create(@Body() createQuestionDto: CreateQuestionDto) {
    return this.questionsService.create(createQuestionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all questions' })
  findAll() {
    return this.questionsService.findAll();
  }

  @Get('book/:bookId')
  @ApiOperation({ summary: 'Get questions by book' })
  findByBook(@Param('bookId') bookId: string) {
    return this.questionsService.findByBook(bookId);
  }

  @Get('chapter/:chapterId')
  @ApiOperation({ summary: 'Get questions by chapter' })
  findByChapter(@Param('chapterId') chapterId: string) {
    return this.questionsService.findByChapter(chapterId);
  }

  @Get('level/:level')
  @ApiOperation({ summary: 'Get questions by difficulty level' })
  findByLevel(@Param('level') level: string) {
    return this.questionsService.findByLevel(level);
  }

  @Post('generate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate questions for a chapter using AI' })
  @ApiQuery({ name: 'count', required: false, type: Number })
  generateQuestions(
    @Body() body: { chapterId: string; bookId: string },
    @Query('count') count: number = 5,
  ) {
    return this.questionsService.generateQuestions(
      body.chapterId,
      body.bookId,
      count,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get question by id' })
  findOne(@Param('id') id: string) {
    return this.questionsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update question' })
  update(@Param('id') id: string, @Body() updateData: any) {
    return this.questionsService.update(id, updateData);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete question' })
  remove(@Param('id') id: string) {
    return this.questionsService.remove(id);
  }
}

