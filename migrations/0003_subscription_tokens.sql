ALTER TABLE subscriptions ADD COLUMN unsubscribe_token_hash TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_unsubscribe_token_hash
  ON subscriptions (unsubscribe_token_hash);
