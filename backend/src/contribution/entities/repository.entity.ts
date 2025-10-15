import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Contribution } from './contribution.entity';

@Entity('repositories')
export class Repository {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  githubId: string;

  @Column()
  name: string;

  @Column()
  fullName: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  url: string;

  @Column({ default: false })
  isPrivate: boolean;

  @OneToMany(() => Contribution, contribution => contribution.repository)
  contributions: Contribution[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

