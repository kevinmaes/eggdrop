import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		globals: true,
		setupFiles: ['./src/test/setup.ts'],
		environment: 'node',
		exclude: ['tests/**/*'],
	},
});
