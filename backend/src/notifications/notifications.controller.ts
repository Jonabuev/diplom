import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a notification' })
  create(@Body() createNotificationDto: any) {
    return this.notificationsService.create(createNotificationDto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get current user notifications' })
  getMyNotifications(@Request() req) {
    return this.notificationsService.findByUser(req.user.userId);
  }

  @Get('unread')
  @ApiOperation({ summary: 'Get unread notifications' })
  getUnreadNotifications(@Request() req) {
    return this.notificationsService.findUnreadByUser(req.user.userId);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  markAllAsRead(@Request() req) {
    return this.notificationsService.markAllAsRead(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get notification by id' })
  findOne(@Param('id') id: string) {
    return this.notificationsService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete notification' })
  remove(@Param('id') id: string) {
    return this.notificationsService.remove(id);
  }

  @Delete('clear-all')
  @ApiOperation({ summary: 'Delete all user notifications' })
  removeAll(@Request() req) {
    return this.notificationsService.removeAllByUser(req.user.userId);
  }
}

