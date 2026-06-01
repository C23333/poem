CREATE TABLE IF NOT EXISTS ai_drafts (
  id TEXT PRIMARY KEY,
  poem_slug TEXT NOT NULL,
  task TEXT NOT NULL,
  prompt_version TEXT NOT NULL,
  provider_name TEXT NOT NULL,
  model_name TEXT NOT NULL,
  input_content_key TEXT NOT NULL,
  output_hash TEXT NOT NULL,
  output_text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  reviewer_user_id TEXT,
  reviewed_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (reviewer_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_ai_drafts_poem_task_status ON ai_drafts (poem_slug, task, status, created_at);
