// ====================================================
// MOCK DATA — ใช้เมื่อ backend server ล่ม
// ====================================================

// ---- Helpers ----
function hoursAgo(h) {
  const d = new Date();
  d.setHours(d.getHours() - h);
  return d.toISOString().slice(0, 16).replace('T', ' ');
}

function timeLabel(h) {
  const d = new Date();
  d.setHours(d.getHours() - h, 0, 0, 0);
  return `${String(d.getHours()).padStart(2, '0')}:00`;
}

const dayNames = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
const dayNamesShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function dayInfo(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return {
    day_name: dayNames[d.getDay()],
    date: `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`,
    weekday: dayNames[d.getDay()],
    iso: d.toISOString().slice(0, 10),
  };
}

// ---- Node list ----
export const MOCK_NODES = [
  { node_name: 'สวนทุเรียนแม่แจ๋ว', latitude: 16.9842, longitude: 98.8734 },
  { node_name: 'สวนทุเรียนบ้านตาก', latitude: 16.8706, longitude: 99.0738 },
  { node_name: 'สวนทุเรียนแม่ระมาด', latitude: 16.9763, longitude: 98.5131 },
];

// ---- Per-node summary (latest reading) ----
export const MOCK_DATA_NODE_SUMMARY = (nodeName) => ({
  node_name: nodeName,
  temp: 31.4,
  humidity: 68,
  light: 42500,
  wind_speed: 12.6,
  wind_gust: 18.3,
  wind_dir: 225,
  pressure: 1010.2,
  rain_1h: 0.0,
  rain_24h: 2.4,
  date: new Date().toLocaleString('th-TH'),
});

// ---- 24-hour data (hourly, last 24 points) ----
function gen24h(nodeName) {
  const base = {
    temp: 29,
    humidity: 72,
    wind_speed: 10,
    pressure: 1010,
    light: 30000,
    rain_1h: 0,
  };
  return Array.from({ length: 24 }, (_, i) => {
    const hour = 23 - i;
    const cycle = Math.sin((hour / 24) * Math.PI * 2);
    return {
      time: timeLabel(23 - i),
      temp: +(base.temp + cycle * 4 + (Math.random() - 0.5) * 1.5).toFixed(1),
      humidity: Math.round(base.humidity - cycle * 10 + (Math.random() - 0.5) * 5),
      wind_speed: +(base.wind_speed + Math.random() * 5).toFixed(1),
      wind_gust: +(base.wind_speed + Math.random() * 8 + 3).toFixed(1),
      pressure: +(base.pressure + (Math.random() - 0.5) * 3).toFixed(1),
      light: Math.max(0, Math.round(base.light * Math.sin(Math.max(0, (hour - 6) / 12) * Math.PI) + Math.random() * 2000)),
      rain_1h: hour > 12 && hour < 16 ? +(Math.random() * 0.8).toFixed(1) : 0,
      node_name: nodeName,
    };
  }).reverse();
}

export const MOCK_24H = (nodeName) => gen24h(nodeName);

// ---- 7-day summary ----
function gen7day() {
  return Array.from({ length: 7 }, (_, i) => {
    const info = dayInfo(i);
    return {
      ...info,
      temp: +(28 + Math.random() * 6).toFixed(1),
      humidity: Math.round(65 + Math.random() * 20),
      wind_speed: +(8 + Math.random() * 10).toFixed(1),
      pressure: +(1008 + Math.random() * 6).toFixed(1),
      rain_1h: +(Math.random() * 2).toFixed(1),
      rain_24h: +(Math.random() * 8).toFixed(1),
      light: Math.round(35000 + Math.random() * 15000),
    };
  });
}

export const MOCK_7DAY = () => gen7day();

// ---- Recent data (last N minutes, 1 point per minute) ----
function genRecent(minutes) {
  return Array.from({ length: minutes }, (_, i) => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - (minutes - 1 - i));
    return {
      time: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`,
      temp: +(31 + (Math.random() - 0.5) * 2).toFixed(1),
      humidity: Math.round(68 + (Math.random() - 0.5) * 6),
      wind_speed: +(12 + (Math.random() - 0.5) * 4).toFixed(1),
      wind_gust: +(17 + Math.random() * 4).toFixed(1),
      pressure: +(1010 + (Math.random() - 0.5) * 1).toFixed(1),
      light: Math.round(42000 + (Math.random() - 0.5) * 5000),
      rain_1h: 0,
    };
  });
}

export const MOCK_RECENT = (minutes) => genRecent(minutes);

// ---- TMD (กรมอุตุนิยมวิทยา) ----
export const MOCK_TMD_24H = Array.from({ length: 24 }, (_, i) => ({
  time: timeLabel(23 - i),
  temperature_tdm: +(26 + Math.sin((i / 24) * Math.PI * 2) * 5 + Math.random() * 1.5).toFixed(1),
  humidity_tdm: Math.round(70 - Math.sin((i / 24) * Math.PI * 2) * 12 + Math.random() * 4),
  wind_speed_tdm: +(8 + Math.random() * 6).toFixed(1),
  rain_tdm: i > 12 && i < 17 ? +(Math.random() * 1.2).toFixed(1) : 0,
  weather_text_tdm: i > 6 && i < 18 ? 'มีเมฆบางส่วน' : 'ท้องฟ้าโปร่ง',
})).reverse();

export const MOCK_TMD_7DAY = Array.from({ length: 7 }, (_, i) => {
  const info = dayInfo(i);
  return {
    ...info,
    temp: +(27 + Math.random() * 5).toFixed(1),
    humidity: Math.round(68 + Math.random() * 15),
    wind_speed: +(7 + Math.random() * 8).toFixed(1),
    rain: +(Math.random() * 5).toFixed(1),
    weather_text: ['มีเมฆบางส่วน', 'ท้องฟ้าโปร่ง', 'มีฝนตก', 'เมฆมาก'][Math.floor(Math.random() * 4)],
  };
});

// ---- MSN Weather ----
export const MOCK_MSN_CURRENT = {
  date_time: new Date().toISOString(),
  temperature_msn: 32,
  humidity_msn: 65,
  wind_speed_msn: 14,
  pm25: 28.4,
  weather_text_msn: 'มีเมฆบางส่วน',
};

export const MOCK_MSN_24H = Array.from({ length: 24 }, (_, i) => ({
  time: timeLabel(23 - i),
  temperature_msn: +(27 + Math.sin((i / 24) * Math.PI * 2) * 6 + Math.random() * 1).toFixed(1),
  humidity_msn: Math.round(65 - Math.sin((i / 24) * Math.PI * 2) * 10 + Math.random() * 5),
  wind_speed_msn: +(10 + Math.random() * 8).toFixed(1),
  pm25: +(22 + Math.random() * 15).toFixed(1),
  weather_text_msn: 'มีเมฆบางส่วน',
})).reverse();

export const MOCK_MSN_7DAY = Array.from({ length: 7 }, (_, i) => {
  const info = dayInfo(i);
  return {
    ...info,
    temp: +(28 + Math.random() * 6).toFixed(1),
    humidity: Math.round(62 + Math.random() * 20),
    wind_speed: +(9 + Math.random() * 9).toFixed(1),
    pm25: +(20 + Math.random() * 20).toFixed(1),
    weather_text: ['มีเมฆบางส่วน', 'ท้องฟ้าโปร่ง', 'ฝนตกเล็กน้อย'][Math.floor(Math.random() * 3)],
  };
});

// ---- Weather.com ----
export const MOCK_WEATHER_CURRENT = {
  date_time: new Date().toISOString(),
  temperature_w: 33,
  humidity_w: 62,
  wind_w: 16,
  pressure_w: 1009,
};

export const MOCK_WEATHER_24H = Array.from({ length: 24 }, (_, i) => ({
  time: timeLabel(23 - i),
  temperature_w: +(28 + Math.sin((i / 24) * Math.PI * 2) * 7 + Math.random() * 1).toFixed(1),
  humidity_w: Math.round(62 - Math.sin((i / 24) * Math.PI * 2) * 12 + Math.random() * 4),
  wind_w: +(11 + Math.random() * 9).toFixed(1),
  pressure_w: +(1008 + (Math.random() - 0.5) * 4).toFixed(1),
})).reverse();

export const MOCK_WEATHER_7DAY = Array.from({ length: 7 }, (_, i) => {
  const info = dayInfo(i);
  return {
    ...info,
    temperature_w: +(29 + Math.random() * 5).toFixed(1),
    humidity_w: Math.round(60 + Math.random() * 20),
    wind_w: +(10 + Math.random() * 9).toFixed(1),
    pressure_w: +(1007 + Math.random() * 6).toFixed(1),
  };
});

// ---- TMD 7-day forecast (CardPre7day) ----
const conditionMap = [
  { cond: 1, cond_th: 'ท้องฟ้าแจ่มใส' },
  { cond: 2, cond_th: 'มีเมฆบางส่วน' },
  { cond: 6, cond_th: 'มีฝนตก' },
  { cond: 3, cond_th: 'เมฆมาก' },
  { cond: 7, cond_th: 'ฝนฟ้าคะนอง' },
  { cond: 5, cond_th: 'ฝนตกเล็กน้อย' },
  { cond: 4, cond_th: 'มีเมฆ' },
];

export const MOCK_PRE7DAY = {
  forecasts: Array.from({ length: 7 }, (_, i) => {
    const info = dayInfo(i);
    const c = conditionMap[Math.floor(Math.random() * conditionMap.length)];
    const tc_max = Math.round(30 + Math.random() * 6);
    const tc_min = Math.round(tc_max - 6 - Math.random() * 4);
    return {
      weekday: info.weekday,
      date: info.iso,
      tc_max,
      tc_min,
      rain: +(Math.random() * 10).toFixed(1),
      rh: Math.round(65 + Math.random() * 20),
      cond: c.cond,
      cond_th: c.cond_th,
    };
  }),
};

// ---- Max data for node ----
export const MOCK_MAX_DATA = (nodeName) => [{
  node_name: nodeName,
  temp: 36.8,
  humidity: 95,
  light: 72000,
  wind_speed: 28.5,
  wind_gust: 41.2,
  pressure: 1015.4,
  rain_1h: 5.6,
  rain_24h: 22.1,
}];
