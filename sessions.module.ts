import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { CountriesModule } from '../countries/countries.module';
import { SessionEntity } from '../common/session.entity';
import { RegionAgentClient } from '../proxy/region-agent.client';
import { SessionsController } from './sessions.controller';
import { SessionsGateway } from './sessions.gateway';
import { SessionsService } from './sessions.service';

@Module({
  imports: [TypeOrmModule.forFeature([SessionEntity]), AuthModule, CountriesModule],
  controllers: [SessionsController],
  providers: [SessionsService, RegionAgentClient, SessionsGateway],
})
export class SessionsModule {}
