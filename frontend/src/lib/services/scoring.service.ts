export interface ScoreBreakdown {
  convention: number;
  size: number;
  filesImpact: number;
  mergeSignal: number;
  metadataCompleteness: number;
}

export class ScoringService {
  static conventionalScore(message: string): number {
    const prefixOk = /^(feat|fix|docs|refactor|test|chore|perf|style|build|ci)(\(.+\))?:\s+/.test(message);
    const lengthOk = message.split('\n')[0].trim().length >= 8;
    return Math.round((prefixOk ? 70 : 30) + (lengthOk ? 30 : 0));
  }

  static sizeScore(additions: number, deletions: number): number {
    const total = additions + deletions;
    if (total === 0) return 40;
    if (total <= 50) return 95;
    if (total <= 200) return 85;
    if (total <= 500) return 70;
    if (total <= 1000) return 55;
    return 40;
  }

  static filesImpactScore(files: Array<{ filename: string; additions?: number; deletions?: number }>): number {
    if (!files || files.length === 0) return 40;
    let score = 60;
    const hasTests = files.some(f => /test|spec|__tests__/i.test(f.filename));
    const mostlyDocs = files.every(f => /\.(md|mdx)$/i.test(f.filename));
    if (hasTests) score += 15;
    if (mostlyDocs) score -= 20;
    const heavyFiles = files.filter(f => (f.additions || 0) + (f.deletions || 0) > 500).length;
    if (heavyFiles > 0) score -= 10;
    return Math.max(30, Math.min(95, score));
  }

  static mergeSignalScore(merged: boolean): number {
    return merged ? 90 : 50;
  }

  static metadataCompletenessScore(message: string, hasLink: boolean): number {
    let score = 50;
    if (message && message.length > 0) score += 20;
    if (hasLink) score += 20;
    if (/close[sd]?\s+#\d+/i.test(message)) score += 10;
    return Math.min(95, score);
  }

  static aggregate(weights: Partial<Record<keyof ScoreBreakdown, number>>, b: ScoreBreakdown): number {
    const w = { convention: 0.25, size: 0.2, filesImpact: 0.2, mergeSignal: 0.15, metadataCompleteness: 0.2, ...weights };
    const total = w.convention * b.convention + w.size * b.size + w.filesImpact * b.filesImpact + w.mergeSignal * b.mergeSignal + w.metadataCompleteness * b.metadataCompleteness;
    return Math.round(total);
  }
}

