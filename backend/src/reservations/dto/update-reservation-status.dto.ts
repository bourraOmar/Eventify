import { IsEnum, IsNotEmpty } from 'class-validator';
import { ReservationStatus } from '../schemas/reservation.schema';

export class UpdateReservationStatusDto {
  @IsNotEmpty()
  @IsEnum(ReservationStatus)
  status: ReservationStatus;
}