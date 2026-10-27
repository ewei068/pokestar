import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { ApiError, isApiError, rateLimitDeadline, request } from "./http";

const originalFetch = globalThis.fetch;
const originalTimeout = globalThis.setTimeout;
afterEach(() => { globalThis.fetch = originalFetch; globalThis.setTimeout = originalTimeout; });
const limited = (header?: string) => new Response(JSON.stringify({ error: "rate_limited" }), {
  status: 429, headers: header === undefined ? {} : { "Retry-After": header },
});

describe("HTTP recovery", () => {
  it("preserves status/code and reads seconds, dates, and a bounded missing/invalid fallback", async () => {
    for (const header of ["7", new Date(Date.now() + 120000).toUTCString(), undefined, "bad", "-2", "Infinity"]) {
      globalThis.fetch = async () => limited(header);
      const before = Date.now();
      await assert.rejects(request("/battles"), (error: unknown) => {
        assert.ok(error instanceof ApiError);
        assert.equal(error.code, "rate_limited");
        assert.ok(isApiError(error, 429));
        const deadline = rateLimitDeadline(error)!;
        const expected = header === "7" ? 7000 : header?.includes(",") ? Date.parse(header) - before : 60000;
        assert.ok(deadline >= before + expected && deadline <= Date.now() + expected);
        return true;
      });
    }
  });

  it("cancels a hung request after 15 seconds without retrying it", async () => {
    let expire = () => {};
    globalThis.setTimeout = ((callback: (...args: unknown[]) => void, delay?: number, ...args: unknown[]) => {
      if (delay === 15000) expire = () => callback(...args);
      return originalTimeout(callback, delay, ...args);
    }) as typeof setTimeout;
    let calls = 0;
    globalThis.fetch = (_input, options) => {
      calls++;
      return new Promise((_resolve, reject) => options!.signal!.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError"))));
    };
    const pending = request("/battles/one/actions", { method: "POST" });
    expire();
    await assert.rejects(pending, { name: "AbortError" });
    assert.equal(calls, 1);
  });

  it("forwards caller cancellation and leaves non-429 behavior intact", async () => {
    const controller = new AbortController();
    let signal: AbortSignal | null | undefined;
    globalThis.fetch = async (_input, options) => { signal = options?.signal; return new Response(null, { status: 204 }); };
    assert.equal(await request("/auth/logout", { signal: controller.signal }), undefined);
    controller.abort();
    assert.equal(signal?.aborted, false); // Listener was removed after completion.
    globalThis.fetch = async () => new Response(JSON.stringify({ error: "login_required" }), { status: 401 });
    await assert.rejects(request("/me"), error => isApiError(error, 401) && rateLimitDeadline(error) === null);
  });
});
