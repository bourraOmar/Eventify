import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { EventStatus } from '../schemas/event.schema';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDateString() 
  date: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsInt()
  @Min(1)
  capacity: number;

  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;
}