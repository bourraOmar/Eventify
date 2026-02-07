import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type EventDocument = HydratedDocument<Event>;

export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CANCELED = 'canceled',
}

@Schema({ timestamps: true })
export class Event {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true, min: 1 })
  capacity: number;

  @Prop({ default: 0 })
  reservedPlaces: number;

  @Prop({
    required: true,
    enum: EventStatus,
    default: EventStatus.DRAFT,
  })
  status: EventStatus;
}

export const EventSchema = SchemaFactory.createForClass(Event);
