import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SessionEntity } from '../common/session.entity';
import { User } from '../common/user.entity';
import { CountriesService } from '../countries/countries.service';
import { RegionAgentClient } from '../proxy/region-agent.client';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(SessionEntity) private readonly sessions: Repository<SessionEntity>,
    private readonly countriesService: CountriesService,
    private readonly regionClient: RegionAgentClient,
  ) {}

  async create(user: User, countryCode: string) {
    const country = this.countriesService.getByCountryCode(countryCode);
    if (!country) throw new BadRequestException('Unsupported country');

    const session = this.sessions.create({
      user,
      countryCode: country.code,
      countryName: country.name,
      regionCode: country.regionCode,
      regionBaseUrl: country.regionBaseUrl,
      status: 'starting',
    });
    const saved = await this.sessions.save(session);

    const regionSession = await this.regionClient.createSession(country.regionBaseUrl, {
      sessionId: saved.id,
      userId: user.id,
      countryCode: country.code,
      countryName: country.name,
    });

    Object.assign(saved, {
      regionSessionId: regionSession.id,
      streamUrl: regionSession.streamUrl,
      publicIp: regionSession.publicIp,
      timezone: regionSession.timezone,
      localTime: regionSession.localTime,
      androidVersion: regionSession.androidVersion,
      deviceModel: regionSession.deviceModel,
      status: regionSession.status,
    });

    return this.sessions.save(saved);
  }

  async listForUser(userId: string) {
    return this.sessions.find({ where: { user: { id: userId } }, order: { updatedAt: 'DESC' } });
  }

  async getForUser(userId: string, id: string) {
    const session = await this.sessions.findOne({ where: { id, user: { id: userId } } });
    if (!session) throw new NotFoundException('Session not found');
    return session;
  }

  async refresh(userId: string, id: string) {
    const session = await this.getForUser(userId, id);
    const remote = await this.regionClient.getSession(session.regionBaseUrl, session.regionSessionId);
    Object.assign(session, remote);
    return this.sessions.save(session);
  }

  async control(userId: string, id: string, action: string, text?: string) {
    const session = await this.getForUser(userId, id);
    return this.regionClient.control(session.regionBaseUrl, session.regionSessionId, { action, text });
  }

  async reset(userId: string, id: string) {
    const session = await this.getForUser(userId, id);
    const remote = await this.regionClient.reset(session.regionBaseUrl, session.regionSessionId);
    Object.assign(session, remote);
    return this.sessions.save(session);
  }

  async screenshot(userId: string, id: string) {
    const session = await this.getForUser(userId, id);
    return this.regionClient.screenshot(session.regionBaseUrl, session.regionSessionId);
  }

  async installApk(userId: string, id: string, filePath: string) {
    const session = await this.getForUser(userId, id);
    return this.regionClient.installApk(session.regionBaseUrl, session.regionSessionId, filePath);
  }
}
