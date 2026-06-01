import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// jsdom 没有真实浏览器 storage；补内存实现让 auth/theme/i18n 测试保持和浏览器同一 API 形状。
class MemoryStorageMock implements Storage {
  private store = new Map<string, string>();

  get length() {
    return this.store.size;
  }

  clear() {
    this.store.clear();
  }

  getItem(key: string) {
    return this.store.get(key) ?? null;
  }

  key(index: number) {
    return Array.from(this.store.keys())[index] ?? null;
  }

  removeItem(key: string) {
    this.store.delete(key);
  }

  setItem(key: string, value: string) {
    this.store.set(key, value);
  }
}

function ensureStorage(name: "localStorage" | "sessionStorage") {
  const value = globalThis[name] as Storage | undefined;
  if (typeof value?.clear === "function" && typeof value?.setItem === "function") return;
  vi.stubGlobal(name, new MemoryStorageMock());
}

// 组件库依赖 ResizeObserver/scrollIntoView，但单测只验证 React 状态和可访问输出，不需要真实布局引擎。
vi.stubGlobal("ResizeObserver", ResizeObserverMock);
ensureStorage("localStorage");
ensureStorage("sessionStorage");
localStorage.setItem("renewlet_locale", "zh-CN");
Element.prototype.scrollIntoView = vi.fn();

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.clearAllMocks();
  ensureStorage("localStorage");
  ensureStorage("sessionStorage");
  localStorage.clear();
  localStorage.setItem("renewlet_locale", "zh-CN");
  sessionStorage.clear();
});
