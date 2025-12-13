import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { HistoryService } from './history.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AddAnswerDto } from './dto/add-answer.dto';

@ApiTags('history')
@Controller('history')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Get()
  @ApiOperation({ summary: 'Get all history records' })
  findAll() {
    return this.historyService.findAll();
  }

  @Get('my')
  @ApiOperation({ summary: 'Get current user history' })
  getMyHistory(@Request() req) {
    return this.historyService.findByUser(req.user.userId);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get user statistics' })
  getStatistics(@Request() req, @Query('bookId') bookId?: string) {
    return this.historyService.getStatistics(req.user.userId, bookId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get history by user' })
  findByUser(@Param('userId') userId: string) {
    return this.historyService.findByUser(userId);
  }

  @Get('book/:bookId')
  @ApiOperation({ summary: 'Get history by book' })
  findByBook(@Param('bookId') bookId: string) {
    return this.historyService.findByBook(bookId);
  }

  @Post('answer')
  @ApiOperation({ summary: 'Record user answer' })
  addAnswer(@Request() req, @Body() body: AddAnswerDto) {
    return this.historyService.addAnswer(
      req.user.userId,
      body.bookId,
      body.questionId,
      body.userAnswer,
      body.isCorrect,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get history record by id' })
  findOne(@Param('id') id: string) {
    return this.historyService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete history record' })
  remove(@Param('id') id: string) {
    return this.historyService.remove(id);
  }
}

