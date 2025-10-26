import { NextRequest, NextResponse } from 'next/server';
import { ContributionRepository } from '@/lib/database/repositories/contribution.repository';
import { BlockchainService } from '@/lib/services/blockchain.service';
import { ContributionStatus } from '@/types/contribution';

const BATCH_LIMIT = 10;

export async function POST(request: NextRequest) {
  try {
    const { limit = BATCH_LIMIT } = (await request.json().catch(() => ({}))) as { limit?: number };

    const candidates = await ContributionRepository.findMany({
      status: 'pending',
      eligibility: 'eligible',
      limit,
    } as any);

    const results: Array<{ id: string; tx?: string; error?: string }> = [];

    for (const c of candidates) {
      try {
        await ContributionRepository.update(c.id, { status: ContributionStatus.MINTING } as any);

        const tx = await BlockchainService.mintContribution(c.id);

        results.push({ id: c.id, tx });
      } catch (err: any) {
        await ContributionRepository.update(c.id, { status: ContributionStatus.FAILED } as any);
        results.push({ id: c.id, error: err?.message || 'mint failed' });
      }
    }

    return NextResponse.json({ processed: results.length, results });
  } catch (error) {
    console.error('Mint-ready route error:', error);
    return NextResponse.json({ error: 'Failed to mint eligible contributions' }, { status: 500 });
  }
}

