import 'dotenv/config';
import http from 'http';

const BASE = process.env.API_BASE_URL ?? 'http://localhost:3333';

function request(path: string, token?: string): Promise<{ status: number; body: any }> {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: 'GET',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode ?? 0, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode ?? 0, body: data });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function main() {
  const masked = BASE.replace(/\/\/[^@]+@/, '//***@');
  console.log('API_BASE_URL:', masked);

  const login = await request('/auth/login', undefined, JSON.stringify({ identifier: 'admingui', password: '@solo2026' }));
  console.log('login status:', login.status);
}