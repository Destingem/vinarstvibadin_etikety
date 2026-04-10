import { describe, expect, it } from 'vitest';
import {
  ApiWineListQuerySchema,
  InternalApiWineListQuerySchema,
} from '../src/server/schemas/api-wines';

describe('wine list query schemas', () => {
  it('keeps the external API limit capped at 100', () => {
    expect(ApiWineListQuerySchema.safeParse({ limit: 1000 }).success).toBe(false);
  });

  it('allows the internal BFF to request up to 1000 wines', () => {
    const parsed = InternalApiWineListQuerySchema.parse({ limit: 1000 });
    expect(parsed.limit).toBe(1000);
  });
});
