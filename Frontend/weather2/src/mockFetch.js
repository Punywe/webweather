/**
 * mockFetch.js
 * 
 * Patches window.fetch so that when the backend returns a network error
 * (ETIMEDOUT / connection refused), mock data is returned instead.
 *
 * Import this ONCE at the top of main.jsx.
 */

import {
  MOCK_NODES,
  MOCK_DATA_NODE_SUMMARY,
  MOCK_24H,
  MOCK_7DAY,
  MOCK_RECENT,
  MOCK_TMD_24H,
  MOCK_TMD_7DAY,
  MOCK_MSN_CURRENT,
  MOCK_MSN_24H,
  MOCK_MSN_7DAY,
  MOCK_WEATHER_CURRENT,
  MOCK_WEATHER_24H,
  MOCK_WEATHER_7DAY,
  MOCK_PRE7DAY,
  MOCK_MAX_DATA,
} from './mockData.js';

// ---- Route matcher ----
// Now accepts parsed body as second arg for POST routes
function mockResponse(url, body = {}) {
  const path = url.replace(/^\/api/, '');

  // POST /login/ — mock credentials
  if (/^\/login\/?/.test(path)) {
    const { username, password } = body;

    if (!username || !password) {
      return { __status__: 400, detail: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' };
    }

    // admin เท่านั้นที่ต้องใส่ password ถูก
    if (username === 'admin') {
      if (password !== 'admin1234') {
        return { __status__: 401, detail: 'รหัสผ่าน admin ไม่ถูกต้อง (mock)' };
      }
      return { user: { username: 'admin', role: 'admin' } };
    }

    // user ทั่วไป — ใส่อะไรก็ login ได้เลย (mock mode)
    return { user: { username: username, role: 'user' } };
  }

  // GET /getNameNode/
  if (/^\/getNameNode\/?/.test(path)) {
    return { nodes: MOCK_NODES };
  }

  // GET /getDataNodeSummary/<node>?...
  if (/^\/getDataNodeSummary\//.test(path)) {
    const nodeName = decodeURIComponent(path.split('/getDataNodeSummary/')[1].split('?')[0]);
    return { data: [MOCK_DATA_NODE_SUMMARY(nodeName)] };
  }

  // GET /getDataNode/<node>
  if (/^\/getDataNode\//.test(path)) {
    const nodeName = decodeURIComponent(path.split('/getDataNode/')[1].split('?')[0]);
    return { data: [MOCK_DATA_NODE_SUMMARY(nodeName)] };
  }

  // GET /get24h/<node>?limit_hours=<n>
  if (/^\/get24h\//.test(path)) {
    const nodeName = decodeURIComponent(path.split('/get24h/')[1].split('?')[0]);
    const urlObj = new URL(url, 'http://localhost');
    const hours = parseInt(urlObj.searchParams.get('limit_hours') || '24', 10);
    const data = MOCK_24H(nodeName).slice(-hours);
    return { data };
  }

  // GET /get7day/<node>
  if (/^\/get7day\//.test(path) && !/MSN|Weather/.test(path)) {
    return { data: MOCK_7DAY() };
  }

  // GET /getRecent/<node>?minutes=<n>
  if (/^\/getRecent\//.test(path)) {
    const urlObj = new URL(url, 'http://localhost');
    const mins = parseInt(urlObj.searchParams.get('minutes') || '60', 10);
    return { data: MOCK_RECENT(Math.min(mins, 180)) };
  }

  // GET /getMaxDataNode/<node>
  if (/^\/getMaxDataNode\//.test(path)) {
    const nodeName = decodeURIComponent(path.split('/getMaxDataNode/')[1].split('?')[0]);
    return MOCK_MAX_DATA(nodeName);
  }

  // ---- TMD ----
  if (/^\/getData24hTMD/.test(path)) { return { data: MOCK_TMD_24H }; }
  if (/^\/getDataTMD/.test(path))    { return { data: MOCK_TMD_7DAY }; }
  if (/^\/getPre7day/.test(path))    { return MOCK_PRE7DAY; }

  // ---- MSN ----
  if (/^\/getDataMSN/.test(path))    { return { data: [MOCK_MSN_CURRENT] }; }
  if (/^\/getData24hmsn/.test(path)) { return { data: MOCK_MSN_24H }; }
  if (/^\/get7dayMSN/.test(path))    { return { data: [MOCK_MSN_7DAY] }; }

  // ---- Weather.com ----
  if (/^\/getCurrentWeather/.test(path))  { return { data: MOCK_WEATHER_CURRENT }; }
  if (/^\/getData24hWeather/.test(path))  { return { data: MOCK_WEATHER_24H }; }
  if (/^\/get7dayWeather/.test(path))     { return { data: MOCK_WEATHER_7DAY }; }

  // No match
  return null;
}

// ---- Fake Response helper ----
function fakeResponse(body) {
  const status = body.__status__ ?? 200;
  const clone = { ...body };
  delete clone.__status__;
  return new Response(JSON.stringify(clone), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// ---- Patch fetch ----
const _originalFetch = window.fetch.bind(window);

window.fetch = async function mockFetch(input, init) {
  const url = typeof input === 'string' ? input : input.url;

  // Only intercept /api/* routes
  if (!url.startsWith('/api/')) {
    return _originalFetch(input, init);
  }

  // Parse body early (needed for POST /login/)
  let parsedBody = {};
  try {
    if (init?.body) {
      parsedBody = JSON.parse(init.body);
    }
  } catch (_) { /* ignore */ }

  try {
    // Try real server first with a 4-second timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const response = await _originalFetch(input, { ...init, signal: controller.signal });
    clearTimeout(timeout);
    return response;
  } catch (_err) {
    // Server unreachable — fall back to mock
    console.warn(`[MockFetch] ⚡ Server unreachable for ${url} — using mock data.`);
    const mockBody = mockResponse(url.replace('/api', ''), parsedBody);
    if (mockBody !== null) {
      return fakeResponse(mockBody);
    }
    return new Response(JSON.stringify({ error: 'mock: no data' }), { status: 503 });
  }
};

// ---- Auto-login as admin (mock mode) ----
const _existing = localStorage.getItem('weather_user');
if (!_existing) {
  localStorage.setItem('weather_user', JSON.stringify({
    user: { username: 'admin', role: 'admin' },
    loginTime: new Date().getTime(),
  }));
  console.log('%c[MockFetch] Auto-logged in as admin (mock mode).', 'color: #34d399; font-weight: bold;');
}

console.log('%c[MockFetch] Mock data interceptor active. Falls back to mock when server is unreachable.', 'color: #60a5fa; font-weight: bold;');
