import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Contribution } from './contribution.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  githubId: string;

  @Column()
  username: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({ nullable: true })
  accessToken: string;

  @Column({ nullable: true })
  walletAddress: string;

  @OneToMany(() => Contribution, contribution => contribution.user)
  contributions: Contribution[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

