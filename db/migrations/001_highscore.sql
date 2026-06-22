-- Migration 001: high_scores table
-- Stores high score records for the Flappy Bird game.
-- Only the maximum score matters; rows are inserted when a new record is set.

CREATE TABLE IF NOT EXISTS high_scores (
  id          TEXT PRIMARY KEY,
  score       INTEGER NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Index to quickly retrieve the maximum score
CREATE INDEX IF NOT EXISTS idx_high_scores_score ON high_scores (score DESC);
