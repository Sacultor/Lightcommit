import { ethers } from 'ethers';
import { ScoreBreakdown } from './scoring.service';

export interface ERC8004Feedback {
  contributor: string;
  repo: string;
  commitSha: string;
  score: number;
  feedbackHash: string;
  timestamp: number;
  nonce: number;
}

export interface ERC8004Metadata {
  score: number;
  breakdown: ScoreBreakdown;
  evidence: {
    diffUrl: string;
    testResults: string;
    linterReport: string;
  };
  commit: string;
  repo: string;
  timestamp: number;
  evaluator: string;
}

export class ERC8004Service {
  static generateFeedbackHash(
    repo: string,
    commitSha: string,
    score: number,
    timestamp: number
  ): string {
    const data = JSON.stringify({
      repo,
      commitSha,
      score,
      timestamp,
    });
    return ethers.keccak256(ethers.toUtf8Bytes(data));
  }

  static async generateMetadataJSON(
    feedback: ERC8004Feedback,
    breakdown: ScoreBreakdown,
    evidence: ERC8004Metadata['evidence']
  ): Promise<string> {
    const metadata: ERC8004Metadata = {
      score: feedback.score,
      breakdown,
      evidence,
      commit: feedback.commitSha,
      repo: feedback.repo,
      timestamp: feedback.timestamp,
      evaluator: process.env.NEXT_PUBLIC_EVALUATOR_ADDRESS || '',
    };
    
    return JSON.stringify(metadata, null, 2);
  }

  static getEIP712Domain(chainId: number, verifyingContract: string) {
    return {
      name: 'LightCommit Reputation',
      version: '1',
      chainId,
      verifyingContract,
    };
  }

  static getEIP712Types() {
    return {
      Feedback: [
        { name: 'contributor', type: 'address' },
        { name: 'repo', type: 'string' },
        { name: 'commitSha', type: 'string' },
        { name: 'score', type: 'uint256' },
        { name: 'feedbackHash', type: 'bytes32' },
        { name: 'timestamp', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
      ],
    };
  }

  static async signFeedback(
    feedback: ERC8004Feedback,
    signer: ethers.Signer,
    chainId: number,
    verifyingContract: string
  ): Promise<string> {
    const domain = this.getEIP712Domain(chainId, verifyingContract);
    const types = this.getEIP712Types();

    const signature = await signer.signTypedData(domain, types, {
      contributor: feedback.contributor,
      repo: feedback.repo,
      commitSha: feedback.commitSha,
      score: feedback.score,
      feedbackHash: feedback.feedbackHash,
      timestamp: feedback.timestamp,
      nonce: feedback.nonce,
    });

    return signature;
  }

  static async verifySignature(
    feedback: ERC8004Feedback,
    signature: string,
    chainId: number,
    verifyingContract: string
  ): Promise<string> {
    const domain = this.getEIP712Domain(chainId, verifyingContract);
    const types = this.getEIP712Types();

    const recoveredAddress = ethers.verifyTypedData(
      domain,
      types,
      {
        contributor: feedback.contributor,
        repo: feedback.repo,
        commitSha: feedback.commitSha,
        score: feedback.score,
        feedbackHash: feedback.feedbackHash,
        timestamp: feedback.timestamp,
        nonce: feedback.nonce,
      },
      signature
    );

    return recoveredAddress;
  }

  static async uploadToIPFS(content: string): Promise<string> {
    try {
      const response = await fetch('/api/ipfs/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error('IPFS upload failed');
      }

      const { ipfsHash } = await response.json();
      return `ipfs://${ipfsHash}`;
    } catch (error) {
      console.error('IPFS upload error:', error);
      return '';
    }
  }

  static parseIPFSUri(uri: string): string {
    if (uri.startsWith('ipfs://')) {
      const hash = uri.replace('ipfs://', '');
      return `https://ipfs.io/ipfs/${hash}`;
    }
    return uri;
  }

  static async fetchMetadataFromIPFS(uri: string): Promise<ERC8004Metadata | null> {
    try {
      const url = this.parseIPFSUri(uri);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch metadata');
      }

      return await response.json();
    } catch (error) {
      console.error('Fetch metadata error:', error);
      return null;
    }
  }
}

