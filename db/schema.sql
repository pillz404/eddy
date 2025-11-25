-- db/schema.sql
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT NOT NULL,     -- public blob URL
  image_path TEXT,             -- blob pathname (used to delete the blob)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
