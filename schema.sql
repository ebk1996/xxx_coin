


CREATE TABLE IF NOT EXISTS applications (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL,
  gender VARCHAR(40) NOT NULL,
  age SMALLINT NOT NULL CHECK (age >= 0 AND age <= 255),
  current_occupation VARCHAR(160) NOT NULL,
  ip_address BYTEA,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uniq_email_created UNIQUE (email, created_at)
);

CREATE INDEX IF NOT EXISTS idx_created_at ON applications (created_at);