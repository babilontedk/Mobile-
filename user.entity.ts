import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { SessionEntity } from './session.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column({ default: 'User' })
  name: string;

  @OneToMany(() => SessionEntity, (session) => session.user)
  sessions: SessionEntity[];
}
