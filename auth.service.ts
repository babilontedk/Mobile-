import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { Repository } from 'typeorm';
import { User } from '../common/user.entity';

@Injectable()
export class AuthService {
  constructor(@InjectRepository(User) private readonly users: Repository<User>) {}

  async signup(name: string, email: string, password: string) {
    const existing = await this.users.findOne({ where: { email } });
    if (existing) throw new BadRequestException('Email already exists');

    const user = this.users.create({
      name,
      email,
      passwordHash: await bcrypt.hash(password, 10),
    });
    const saved = await this.users.save(user);
    return this.issueToken(saved);
  }

  async login(email: string, password: string) {
    const user = await this.users.findOne({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    return this.issueToken(user);
  }

  async verifyToken(token: string) {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'change-me') as { sub: string };
    const user = await this.users.findOne({ where: { id: payload.sub } });
    if (!user) throw new UnauthorizedException('User not found');
    return user;
  }

  private issueToken(user: User) {
    const accessToken = jwt.sign(
      { sub: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET || 'change-me',
      { expiresIn: '7d' },
    );

    return {
      accessToken,
      user: { id: user.id, email: user.email, name: user.name },
    };
  }
}
