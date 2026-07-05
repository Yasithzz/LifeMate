// Maps locale codes → display names shown in the settings dropdown
export const LANGUAGE_OPTIONS = [
  { code: 'en-US', label: 'English (US)' },
  { code: 'en-GB', label: 'English (UK)' },
  { code: 'es',    label: 'Spanish' },
  { code: 'fr',    label: 'French' },
  { code: 'de',    label: 'German' },
  { code: 'ja',    label: 'Japanese' },
  { code: 'zh-CN', label: 'Chinese (Simplified)' },
  { code: 'ar',    label: 'Arabic' },
  { code: 'hi',    label: 'Hindi' },
  { code: 'pt-BR', label: 'Portuguese (Brazil)' },
]

// Each entry has the display label + the IANA timezone id that Intl understands
export const TIMEZONE_OPTIONS = [
  { label: '(GMT+5:30) Colombo',      iana: 'Asia/Colombo' },
  { label: '(GMT+5:30) Mumbai',       iana: 'Asia/Kolkata' },
  { label: '(GMT+0:00) London',       iana: 'Europe/London' },
  { label: '(GMT+1:00) Paris',        iana: 'Europe/Paris' },
  { label: '(GMT+2:00) Cairo',        iana: 'Africa/Cairo' },
  { label: '(GMT+3:00) Riyadh',       iana: 'Asia/Riyadh' },
  { label: '(GMT+4:00) Dubai',        iana: 'Asia/Dubai' },
  { label: '(GMT+8:00) Singapore',    iana: 'Asia/Singapore' },
  { label: '(GMT+8:00) Beijing',      iana: 'Asia/Shanghai' },
  { label: '(GMT+9:00) Tokyo',        iana: 'Asia/Tokyo' },
  { label: '(GMT+10:00) Sydney',      iana: 'Australia/Sydney' },
  { label: '(GMT-5:00) New York',     iana: 'America/New_York' },
  { label: '(GMT-6:00) Chicago',      iana: 'America/Chicago' },
  { label: '(GMT-7:00) Denver',       iana: 'America/Denver' },
  { label: '(GMT-8:00) Los Angeles',  iana: 'America/Los_Angeles' },
  { label: '(GMT-3:00) São Paulo',    iana: 'America/Sao_Paulo' },
  { label: '(GMT+0:00) UTC',          iana: 'UTC' },
]

export function getLocale() {
  return localStorage.getItem('lm_locale') || 'en-US'
}

export function getTimezone() {
  return localStorage.getItem('lm_tz') || Intl.DateTimeFormat().resolvedOptions().timeZone
}

// Format a date value (Date, ISO string, or timestamp) with stored locale + timezone
export function formatDate(date, options = {}) {
  try {
    return new Intl.DateTimeFormat(getLocale(), {
      timeZone: getTimezone(),
      ...options,
    }).format(date instanceof Date ? date : new Date(date))
  } catch {
    return String(date)
  }
}

// Shortcut for common date display
export function fmtDate(date) {
  return formatDate(date, { month: 'short', day: 'numeric', year: 'numeric' })
}

// Shortcut for short date (no year)
export function fmtDateShort(date) {
  return formatDate(date, { month: 'short', day: 'numeric' })
}

// Full weekday + date (used in dashboard headers)
export function fmtDateLong(date) {
  return formatDate(date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

// Time only
export function fmtTime(date) {
  return formatDate(date, { hour: '2-digit', minute: '2-digit' })
}
