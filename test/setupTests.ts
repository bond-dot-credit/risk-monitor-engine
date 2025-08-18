import '@testing-library/jest-dom';

// Global test setup can go here (mock timers, global fetch, etc.)

// Provide a lightweight mock for Next.js server helpers used in route tests
jest.mock('next/server', () => {
	class NextRequest {
		url: string;
		body: any;
		constructor(input: any) {
			this.url = typeof input === 'string' ? input : input?.url;
			this.body = input?.body;
		}
		async json() {
			if (this.body) {
				try { return JSON.parse(this.body); } catch { return this.body; }
			}
			return {};
		}
	}

	const NextResponse = {
		json: (payload: any, opts?: any) => {
			return {
				status: opts?.status || 200,
				json: async () => payload
			} as any;
		}
	};

	return { NextRequest, NextResponse };
});
