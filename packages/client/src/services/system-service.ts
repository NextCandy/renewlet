import { apiFetch } from "@/lib/api-client";
import {
  systemRestartResponseSchema,
  systemUpdateResponseSchema,
  systemVersionResponseSchema,
  type SystemRestartResponse,
  type SystemUpdateResponse,
  type SystemVersionResponse,
} from "@/lib/api/schemas/app";

export const systemService = {
  async version(force = false, signal?: AbortSignal): Promise<SystemVersionResponse> {
    const params = new URLSearchParams({ force: force ? "true" : "false" });
    return await apiFetch(`/api/app/admin/system/version?${params.toString()}`, systemVersionResponseSchema, signal ? { signal } : undefined);
  },

  async update(): Promise<SystemUpdateResponse> {
    return await apiFetch("/api/app/admin/system/update", systemUpdateResponseSchema, {
      method: "POST",
      body: JSON.stringify({}),
      timeoutMs: 180_000,
    });
  },

  async restart(): Promise<SystemRestartResponse> {
    return await apiFetch("/api/app/admin/system/restart", systemRestartResponseSchema, {
      method: "POST",
      body: JSON.stringify({}),
      timeoutMs: 10_000,
    });
  },
};
