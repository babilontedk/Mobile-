import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { CountriesModule } from './countries/countries.module';
import { SessionsModule } from './sessions/sessions.module';
import { User } from './common/user.entity';
import { SessionEntity } from './common/session.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: process.env.NODE_ENV === 'production' ? '/app/data/cloud-android-lab.sqlite' : 'cloud-android-lab.sqlite',
      entities: [User, SessionEntity],
      synchronize: true,
    }),
    AuthModule,
    CountriesModule,
    SessionsModule,
  ],
})
export class AppModule {}
