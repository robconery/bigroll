CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    key text NOT NULL DEFAULT gen_random_uuid(),
    slug text NOT NULL,
    tag text,
    title text NOT NULL,
    excerpt text,
    body text,
    image text,
    published boolean NOT NULL DEFAULT false,
    published_at timestamp without time zone,
    created_at timestamp without time zone
);