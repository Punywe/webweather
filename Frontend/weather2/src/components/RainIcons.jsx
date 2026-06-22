import React from 'react'

// ----------------------------------------
// SVG Rain Icon Components (Pro-style, no emoji)
// ----------------------------------------

export const LightRainIcon = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Cloud */}
    <path
      d="M46 30H18C13.582 30 10 26.418 10 22C10 17.582 13.582 14 18 14C18.34 14 18.676 14.018 19.006 14.05C20.292 10.528 23.656 8 27.6 8C32.524 8 36.52 11.836 36.938 16.68C37.624 16.244 38.434 16 39.3 16C41.894 16 44 18.106 44 20.7C44 20.802 43.996 20.902 43.99 21H46C49.314 21 52 23.686 52 27C52 30.314 49.314 33 46 33L46 30Z"
      fill="#93C5FD" stroke="#60A5FA" strokeWidth="1.5" strokeLinejoin="round"
    />
    <path d="M10 22C10 17.582 13.582 14 18 14C18.34 14 18.676 14.018 19.006 14.05C20.292 10.528 23.656 8 27.6 8C32.524 8 36.52 11.836 36.938 16.68" stroke="#BFDBFE" strokeWidth="1" strokeLinecap="round" />
    {/* Light rain drops */}
    <line x1="22" y1="38" x2="20" y2="46" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" />
    <line x1="30" y1="38" x2="28" y2="46" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" />
    <line x1="38" y1="38" x2="36" y2="46" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

export const ModerateRainIcon = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Darker cloud */}
    <path
      d="M46 28H18C13.582 28 10 24.418 10 20C10 15.582 13.582 12 18 12C18.34 12 18.676 12.018 19.006 12.05C20.292 8.528 23.656 6 27.6 6C32.524 6 36.52 9.836 36.938 14.68C37.624 14.244 38.434 14 39.3 14C41.894 14 44 16.106 44 18.7C44 18.802 43.996 18.902 43.99 19H46C49.314 19 52 21.686 52 25C52 28.314 49.314 31 46 31L46 28Z"
      fill="#60A5FA" stroke="#3B82F6" strokeWidth="1.5" strokeLinejoin="round"
    />
    {/* Moderate rain drops - more drops, longer */}
    <line x1="20" y1="36" x2="17" y2="46" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="28" y1="36" x2="25" y2="46" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="36" y1="36" x2="33" y2="46" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="44" y1="36" x2="41" y2="46" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" />
    {/* Second row */}
    <line x1="24" y1="44" x2="22" y2="52" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" />
    <line x1="40" y1="44" x2="38" y2="52" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

export const HeavyRainIcon = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Dark storm cloud */}
    <path
      d="M48 26H16C11.029 26 7 21.971 7 17C7 12.029 11.029 8 16 8C16.388 8 16.772 8.022 17.15 8.062C18.66 4.452 22.26 2 26.4 2C31.696 2 36 6.206 36.482 11.572C37.284 11.21 38.172 11 39.1 11C41.994 11 44.344 13.21 44.488 16.064C44.659 16.022 44.836 16 45.016 16C47.766 16 50 18.234 50 20.984L50 23C50 24.657 48.657 26 47 26H48Z"
      fill="#3B82F6" stroke="#1D4ED8" strokeWidth="1.5" strokeLinejoin="round"
    />
    {/* Many heavy rain drops */}
    <line x1="16" y1="32" x2="12" y2="44" stroke="#1D4ED8" strokeWidth="3" strokeLinecap="round" />
    <line x1="25" y1="32" x2="21" y2="44" stroke="#1D4ED8" strokeWidth="3" strokeLinecap="round" />
    <line x1="34" y1="32" x2="30" y2="44" stroke="#1D4ED8" strokeWidth="3" strokeLinecap="round" />
    <line x1="43" y1="32" x2="39" y2="44" stroke="#1D4ED8" strokeWidth="3" strokeLinecap="round" />
    <line x1="20" y1="42" x2="16" y2="54" stroke="#60A5FA" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="30" y1="42" x2="26" y2="54" stroke="#60A5FA" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="40" y1="42" x2="36" y2="54" stroke="#60A5FA" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="48" y1="42" x2="44" y2="52" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

export const VeryHeavyRainIcon = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Very dark storm cloud */}
    <path
      d="M48 25H16C11.029 25 7 20.971 7 16C7 11.029 11.029 7 16 7C16.388 7 16.772 7.022 17.15 7.062C18.66 3.452 22.26 1 26.4 1C31.696 1 36 5.206 36.482 10.572C37.284 10.21 38.172 10 39.1 10C41.994 10 44.344 12.21 44.488 15.064C44.659 15.022 44.836 15 45.016 15C47.766 15 50 17.234 50 19.984L50 22C50 23.657 48.657 25 47 25H48Z"
      fill="#1D4ED8" stroke="#1E3A8A" strokeWidth="1.5" strokeLinejoin="round"
    />
    {/* Lightning bolt */}
    <path d="M32 28L27 36H32L26 46L38 34H32L37 28Z" fill="#FCD34D" stroke="#F59E0B" strokeWidth="0.5" strokeLinejoin="round" />
    {/* Torrential rain drops */}
    <line x1="14" y1="32" x2="10" y2="46" stroke="#1D4ED8" strokeWidth="3" strokeLinecap="round" />
    <line x1="49" y1="32" x2="45" y2="46" stroke="#1D4ED8" strokeWidth="3" strokeLinecap="round" />
    <line x1="18" y1="44" x2="14" y2="56" stroke="#60A5FA" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="46" y1="44" x2="42" y2="56" stroke="#60A5FA" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="10" y1="42" x2="7" y2="52" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" />
    <line x1="52" y1="40" x2="49" y2="50" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

// ----------------------------------------
// Utility: คำนวณ RainTrend3 จาก array ของ 7-day data
// ใช้ max_rain 3 วันแรก (ล่าสุด 3 วัน)
// ----------------------------------------

export const calcRainTrend3 = (data7day) => {
  if (!data7day || data7day.length === 0) return 0
  const last3 = data7day.slice(0, 3)
  const validRains = last3.map(d => d.max_rain ?? 0)
  const sum = validRains.reduce((acc, v) => acc + v, 0)
  return validRains.length > 0 ? sum / validRains.length : 0
}

// ----------------------------------------
// Utility: Return rain icon component ตาม RainTrend3
// คืนค่า null ถ้าไม่มีฝน (ให้ component แม่ใช้ icon เดิม)
// ----------------------------------------

export const getRainIcon = (rainTrend3, className = '') => {
  if (rainTrend3 < 0.1) return null // ไม่มีฝน — ใช้ icon เดิม
  if (rainTrend3 < 10)  return <LightRainIcon className={className} />
  if (rainTrend3 < 35)  return <ModerateRainIcon className={className} />
  if (rainTrend3 < 90)  return <HeavyRainIcon className={className} />
  return <VeryHeavyRainIcon className={className} />
}

// ----------------------------------------
// Utility: Return rain level label ภาษาไทย
// ----------------------------------------

export const getRainLabel = (rainTrend3) => {
  if (rainTrend3 < 0.1) return null
  if (rainTrend3 < 10)  return 'ฝนเล็กน้อย'
  if (rainTrend3 < 35)  return 'ฝนปานกลาง'
  if (rainTrend3 < 90)  return 'ฝนหนัก'
  return 'ฝนหนักมาก'
}
