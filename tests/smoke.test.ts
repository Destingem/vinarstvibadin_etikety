import { afterEach, describe, expect, it, vi } from "vitest";

describe("Appwrite env smoke", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("builds the server and public Appwrite env contracts", async () => {
    vi.stubEnv("APPWRITE_ENDPOINT", "https://appwrite.example/v1");
    vi.stubEnv("APPWRITE_PROJECT_ID", "project-123");
    vi.stubEnv("APPWRITE_KEY", "secret-key");
    vi.stubEnv("NEXT_PUBLIC_APPWRITE_ENDPOINT", "https://appwrite.example/v1");
    vi.stubEnv("NEXT_PUBLIC_APPWRITE_PROJECT_ID", "project-123");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3232");

    const { getAppwriteUrl, getPublicAppwriteEnv, getServerAppwriteEnv } = await import(
      "../src/lib/appwrite-env"
    );

    expect(getPublicAppwriteEnv()).toEqual({
      endpoint: "https://appwrite.example/v1",
      projectId: "project-123",
      projectName: "project-123",
      appUrl: "http://localhost:3232",
    });

    expect(getServerAppwriteEnv()).toEqual({
      endpoint: "https://appwrite.example/v1",
      projectId: "project-123",
      apiKey: "secret-key",
    });

    expect(getAppwriteUrl("/databases")).toBe("https://appwrite.example/v1/databases");
  });
});
