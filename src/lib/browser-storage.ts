export function readLocalSetting(key: string): string | null {
  try { return typeof window === "undefined" ? null : window.localStorage.getItem(key) } catch { return null }
}
export function writeLocalSetting(key: string, value: string): void {
  try { window.localStorage.setItem(key, value) } catch { /* 저장소 없이도 현재 화면은 동작한다. */ }
}
