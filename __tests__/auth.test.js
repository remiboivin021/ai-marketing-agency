const request = require('supertest');
const express = require('express');

// Mock environment variables for testing
process.env.ADMIN_USER = 'testuser';
process.env.ADMIN_PASSWORD = 'testpass';

// Import after env is set
const { basicAuth } = require('../server/middleware/auth.js');

// Create test app with auth middleware
function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use('/api', basicAuth);
  
  app.get('/api/test', (req, res) => {
    res.json({ message: 'success' });
  });
  
  return app;
}

describe('Basic Auth Middleware', () => {
  let app;

  beforeEach(() => {
    app = createTestApp();
  });

  test('should return 401 if no Authorization header', async () => {
    const res = await request(app).get('/api/test');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Unauthorized');
  });

  test('should return 401 if invalid credentials', async () => {
    const res = await request(app)
      .get('/api/test')
      .set('Authorization', 'Basic ' + Buffer.from('wrong:wrong').toString('base64'));
    
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Unauthorized');
  });

  test('should return 200 with valid credentials', async () => {
    const res = await request(app)
      .get('/api/test')
      .set('Authorization', 'Basic ' + Buffer.from('testuser:testpass').toString('base64'));
    
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('success');
  });

  test('should return 401 with malformed Authorization header', async () => {
    const res = await request(app)
      .get('/api/test')
      .set('Authorization', 'Bearer invalid');
    
    expect(res.status).toBe(401);
  });

  test('should return 401 with empty credentials', async () => {
    const res = await request(app)
      .get('/api/test')
      .set('Authorization', 'Basic ' + Buffer.from(':').toString('base64'));
    
    expect(res.status).toBe(401);
  });
});

describe('Auth Middleware - Disabled Mode', () => {
  test('should allow requests when auth is disabled', async () => {
    // Temporarily remove credentials
    const savedUser = process.env.ADMIN_USER;
    const savedPass = process.env.ADMIN_PASSWORD;
    
    delete process.env.ADMIN_USER;
    delete process.env.ADMIN_PASSWORD;
    
    // Re-require to pick up env change
    delete require.cache[require.resolve('../server/middleware/auth.js')];
    const { basicAuth: noAuth } = require('../server/middleware/auth.js');
    
    const app = express();
    app.use(express.json());
    app.use('/api', noAuth);
    app.get('/api/test', (req, res) => res.json({ message: 'success' }));
    
    const res = await request(app).get('/api/test');
    
    // Restore env
    process.env.ADMIN_USER = savedUser;
    process.env.ADMIN_PASSWORD = savedPass;
    
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('success');
  });
});
