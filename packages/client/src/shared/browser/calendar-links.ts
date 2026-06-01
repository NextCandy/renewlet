import { addDateOnly, toPlainDate, type DateOnly } from "@/lib/time/date-only";

interface AndroidCalendarIntentInput {
  title: string;
  description?: string;
  startDate: DateOnly | string;
  endDate?: DateOnly | string;
  fallbackUrl?: string | undefined;
}

const ANDROID_CHROME_RE = /\bAndroid\b/i;
const CHROME_RE = /\bChrome\/\d+/i;
const CHROME_VARIANT_RE = /\b(?:EdgA|OPR|Firefox|SamsungBrowser|CriOS)\b/i;
const DAY_MS = 24 * 60 * 60 * 1000;

/** 把登录后展示的 http(s) feed URL 转为系统日历更容易接管的 webcal URL。 */
export function toWebcalUrl(feedUrl: string): string {
  try {
    const url = new URL(feedUrl);
    if (url.protocol === "http:" || url.protocol === "https:") {
      return `webcal://${url.host}${url.pathname}${url.search}${url.hash}`;
    }
    return url.toString();
  } catch {
    return feedUrl.replace(/^https?:\/\//i, "webcal://");
  }
}

/** 触发系统日历协议处理器；返回 href 便于测试和不支持 window.open 的环境兜底。 */
export function openWebcalUrl(feedUrl: string): string {
  const href = toWebcalUrl(feedUrl);
  if (typeof window !== "undefined" && typeof window.open === "function") {
    // webcal 只交给系统/浏览器协议处理器；Web 不能保证所有平台都已注册系统日历处理器。
    window.open(href, "_self");
  }
  return href;
}

export function isAndroidChromeUserAgent(userAgent = typeof navigator === "undefined" ? "" : navigator.userAgent): boolean {
  return ANDROID_CHROME_RE.test(userAgent) && CHROME_RE.test(userAgent) && !CHROME_VARIANT_RE.test(userAgent);
}

/** Android Chrome 没有稳定 webcal 处理器时，用 calendar intent 预填一次性事件。 */
export function buildAndroidCalendarIntentUrl(input: AndroidCalendarIntentInput): string {
  const startMs = dateOnlyToUtcStartMs(input.startDate);
  const endMs = dateOnlyToUtcStartMs(input.endDate ?? addDateOnly(input.startDate, { days: 1 }));
  const extras = [
    "action=android.intent.action.INSERT",
    "type=vnd.android.cursor.dir/event",
    `S.title=${encodeIntentValue(input.title)}`,
    `l.beginTime=${startMs}`,
    `l.endTime=${Math.max(endMs, startMs + DAY_MS)}`,
    "B.allDay=true",
  ];

  if (input.description) {
    extras.push(`S.description=${encodeIntentValue(input.description)}`);
  }
  if (input.fallbackUrl) {
    extras.push(`S.browser_fallback_url=${encodeIntentValue(input.fallbackUrl)}`);
  }

  // Android 原生日历只能通过用户点击触发的 intent 预填事件；Web 不能静默写入系统日历。
  return `intent://renewlet/calendar-event#Intent;${extras.join(";")};end`;
}

function dateOnlyToUtcStartMs(date: DateOnly | string): number {
  const value = toPlainDate(date);
  return Date.UTC(value.year, value.month - 1, value.day);
}

function encodeIntentValue(value: string): string {
  return encodeURIComponent(value);
}
