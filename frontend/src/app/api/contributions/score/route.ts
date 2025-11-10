import { NextRequest, NextResponse } from 'next/server';
import { ContributionRepository } from '@/lib/database/repositories/contribution.repository';
import { ScoringService } from '@/lib/services/scoring.service';
import { GitHubService } from '@/lib/services/github.service';

const DEFAULT_LIMIT = 20;
const AI_VERSION = 'rule-based-v0.1';
const MINT_THRESHOLD = 80;

export async function POST(request: NextRequest) {
  try {
    const { limit = DEFAULT_LIMIT } = (await request.json().catch(() => ({}))) as { limit?: number };

    const pending = await ContributionRepository.findMany({
      status: 'pending',
      limit,
      whereScoreNull: true,
    } as any);

    const updated: Array<{ id: string; score: number }> = [];

    for (const c of pending) {
      try {
        let additions = 0;
        let deletions = 0;
        let files: Array<{ filename: string; additions?: number; deletions?: number }> = [];
        const merged = c.type === 'pull_request';

        // Try fetch commit details if commit sha is available in metadata
        const sha = (c.metadata as any)?.sha;
        const repoFull = c.repository?.fullName || (c.metadata as any)?.repo;

        if (sha && repoFull && repoFull.includes('/')) {
          const [owner, repo] = repoFull.split('/');
          const commit = await GitHubService.getCommitDetails(owner, repo, sha).catch(() => null);
          if (commit) {
            additions = commit.stats?.additions || 0;
            deletions = commit.stats?.deletions || 0;
            files = (commit.files || []).map(f => ({ filename: f.filename, additions: f.additions, deletions: f.deletions }));
          }
        }

        // Fallback to metadata counters
        if (!additions && !deletions) {
          additions = (c.metadata as any)?.additions || 0;
          deletions = (c.metadata as any)?.deletions || 0;
        }

        const message = (c.title || '') + '\n' + (c.description || '');
        const hasLink = /https?:\/\//i.test(message);

        const breakdown = {
          convention: ScoringService.conventionalScore(message),
          size: ScoringService.sizeScore(additions, deletions),
          filesImpact: ScoringService.filesImpactScore(files),
          mergeSignal: ScoringService.mergeSignalScore(!!merged),
          metadataCompleteness: ScoringService.metadataCompletenessScore(message, hasLink),
        };

        const score = ScoringService.aggregate({}, breakdown);
        const eligibility = score >= MINT_THRESHOLD ? 'eligible' : 'ineligible';

        await ContributionRepository.update(c.id, {
          score,
          scoreBreakdown: breakdown as any,
          eligibility,
          aiVersion: AI_VERSION,
        } as any);

        updated.push({ id: c.id, score });
      } catch (err) {
        console.error('Score calc failed for contribution', c.id, err);
      }
    }

    return NextResponse.json({ updated: updated.length, details: updated });
  } catch (error) {
    console.error('Score route error:', error);
    return NextResponse.json({ error: 'Failed to score contributions' }, { status: 500 });
  }
}

