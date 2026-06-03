UPDATE public.google_connections
SET status = 'needs_reconnect',
    last_error = 'Additional Google Analytics scopes are now required. Please reconnect your Google account.',
    access_token = NULL,
    access_token_expires_at = NULL
WHERE status = 'connected'
  AND NOT (scopes @> ARRAY['https://www.googleapis.com/auth/analytics.readonly','https://www.googleapis.com/auth/analytics.edit']::text[]);