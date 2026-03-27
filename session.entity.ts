import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('sessions')
export class SessionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  countryCode: string;

  @Column()
  countryName: string;

  @Column()
  regionCode: string;

  @Column()
  regionBaseUrl: string;

  @Column({ nullable: true })
  streamUrl: string;

  @Column({ nullable: true })
  publicIp: string;

  @Column({ nullable: true })
  timezone: string;

  @Column({ nullable: true })
  localTime: string;

  @Column({ nullable: true })
  androidVersion: string;

  @Column({ nullable: true })
  deviceModel: string;

  @Column({ default: 'starting' })
  status: string;

  @Column({ nullable: true })
  regionSessionId: string;

  @ManyToOne(() => User, (user) => user.sessions, { eager: true })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
