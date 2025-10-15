import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Repository } from './repository.entity';

export enum ContributionType {
  COMMIT = 'commit',
  PULL_REQUEST = 'pull_request',
  ISSUE = 'issue',
}

export enum ContributionStatus {
  PENDING = 'pending',
  MINTING = 'minting',
  MINTED = 'minted',
  FAILED = 'failed',
}

@Entity('contributions')
export class Contribution {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  githubId: string;

  @Column({
    type: 'enum',
    enum: ContributionType,
  })
  type: ContributionType;

  @ManyToOne(() => User, user => user.contributions)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Repository, repository => repository.contributions)
  @JoinColumn({ name: 'repositoryId' })
  repository: Repository;

  @Column()
  repositoryId: string;

  @Column()
  contributor: string;

  @Column({ nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  url: string;

  @Column({
    type: 'enum',
    enum: ContributionStatus,
    default: ContributionStatus.PENDING,
  })
  status: ContributionStatus;

  @Column({ nullable: true })
  transactionHash: string;

  @Column({ nullable: true })
  tokenId: string;

  @Column({ nullable: true })
  metadataUri: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

