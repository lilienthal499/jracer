import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom', // Simulates browser DOM
    globals: true, // Use global describe, it, expect without imports
    setupFiles: ['./tests/vitest/setup.js'], // Load test setup
    include: ['tests/vitest/**/*.test.js'], // Only run Vitest tests
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['js/**/*.js'],
      exclude: ['js/view/**', 'tests/**']
    }
  }
});
