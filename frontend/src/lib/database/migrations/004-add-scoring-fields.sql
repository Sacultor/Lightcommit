-- Add scoring-related fields to contributions table
ALTER TABLE IF EXISTS contributions
  ADD COLUMN IF NOT EXISTS score NUMERIC,
  ADD COLUMN IF NOT EXISTS "scoreBreakdown" JSONB,
  ADD COLUMN IF NOT EXISTS eligibility TEXT,
  ADD COLUMN IF NOT EXISTS "aiVersion" TEXT;

-- Index for querying eligible high-score items
CREATE INDEX IF NOT EXISTS idx_contributions_score ON contributions(score);
CREATE INDEX IF NOT EXISTS idx_contributions_eligibility ON contributions(eligibility);

