import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ReservationsModule } from './reservations/reservations.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { DatabaseSeedService } from './database/database-seed.service';
import { User, UserSchema } from './users/schemas/user.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(
      process.env.MONGO_URI || 'mongodb://localhost:27017/eventify',
    ),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    UsersModule,
    AuthModule,
    ReservationsModule,
  ],
  controllers: [AppController],
  providers: [AppService, DatabaseSeedService],
})
export class AppModule {}
