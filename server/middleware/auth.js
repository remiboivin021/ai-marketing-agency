/**
 * Basic Authentication middleware for Express
 * Protects all /api/* endpoints with Basic Auth
 * Credentials are read from .env (ADMIN_USER, ADMIN_PASSWORD)
 */

/**
 * Basic Auth middleware
 * Returns 401 with WWW-Authenticate header if auth fails
 */
export function basicAuth(req, res, next) {
  // Load credentials from environment (dynamic read)
  const ADMIN_USER = process.env.ADMIN_USER || '';
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
  
  // If credentials are not configured, disable auth (development mode)
  if (!ADMIN_USER || !ADMIN_PASSWORD) {
    console.warn('[auth] ADMIN_USER or ADMIN_PASSWORD not set - auth disabled');
    return next();
  }

  // Check for Authorization header
  const authHeader = req.headers['authorization'];
  
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return sendUnauthorized(res);
  }

  // Decode and verify credentials
  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString();
  const [username, password] = credentials.split(':');

  if (username === ADMIN_USER && password === ADMIN_PASSWORD) {
    // Authentication successful
    return next();
  }

  // Authentication failed
  console.warn(`[auth] Failed login attempt for user: ${username}`);
  return sendUnauthorized(res);
}

/**
 * Send 401 Unauthorized response with WWW-Authenticate header
 */
function sendUnauthorized(res) {
  res.setHeader('WWW-Authenticate', 'Basic realm="AI Marketing Agency API"');
  return res.status(401).json({ error: 'Unauthorized' });
}
