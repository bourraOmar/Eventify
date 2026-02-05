import { IsNotEmpty, IsMongoId } from 'class-validator';

export class CreateReservationDto {
  @IsNotEmpty()
  @IsMongoId()
  eventId: string;
}
