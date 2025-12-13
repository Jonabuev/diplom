import { IsString, IsBoolean, IsOptional, IsUUID, IsIn } from 'class-validator';

export class CreateNotificationDto {
  @IsUUID()
  userId: string;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsString()
  @IsIn(['info', 'success', 'warning', 'error'])
  @IsOptional()
  type?: string;

  @IsBoolean()
  @IsOptional()
  isRead?: boolean;

  @IsString()
  @IsOptional()
  link?: string;
}



