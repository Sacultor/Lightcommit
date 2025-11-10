export interface AgentProfile {
  wallet: string;
  githubUsername: string;
  agentCardURI: string;
  registeredAt: bigint;
  active: boolean;
}

export interface Feedback {
  contributor: string;
  repo: string;
  commitSha: string;
  feedbackHash: string;
  timestamp: bigint;
  score: number;
  evaluator: string;
  metadataURI: string;
  exists: boolean;
}

export interface SubmitParams {
  contributor: string;
  repo: string;
  commitSha: string;
  score: number;
  feedbackHash: string;
  metadataURI: string;
  timestamp: number;
  nonce: number;
}

export interface ValidationStatus {
  hasBeenMinted: boolean;
  tokenId: bigint;
}

export interface ContributorReputation {
  totalScore: bigint;
  feedbackCount: bigint;
  averageScore: bigint;
}

export interface CommitData {
  repo: string;
  commit: string;
  linesAdded: bigint;
  linesDeleted: bigint;
  testsPass: boolean;
  timestamp: bigint;
  author: string;
  message: string;
  merged: boolean;
}

