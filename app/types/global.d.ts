import { z } from 'zod';

declare global {
  interface Window {
    _env: z.infer<typeof import('../config/env').envSchema>;
  }
}

export {}; 