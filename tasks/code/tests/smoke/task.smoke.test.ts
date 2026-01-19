import { describe, it, expect } from '@jest/globals';

describe('Smoke test - users & tasks services', () => {
    const usersUrl = 'http://localhost:3012';
    const tasksUrl = 'http://localhost:3010';
    const testUserId = 1;

    // --------- Users service smoke test ---------
    it('auth login endpoint responds', async () => {
        try {
            const res = await fetch(`${usersUrl}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: 'smoke@test.com', password: '123456' }),
            });
            expect(res.status).toBeLessThan(500);
        } catch (_) {
            throw new Error('Users service is not running on port 3012');
        }
    });

    // --------- Tasks service smoke test ---------
    it('can add a task', async () => {
        try {
            const res = await fetch(`${tasksUrl}/tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: testUserId,
                    title: 'Smoke Test Task',
                    category: 'Testing',
                    priority: 'High',
                    endDate: new Date().toISOString(),
                }),
            });
            expect(res.status).toBeLessThan(500);
        } catch (_) {
            throw new Error('Tasks service is not running on port 3010');
        }
    });
 
    it('can get tasks for a user', async () => {
        try {
            const res = await fetch(`${tasksUrl}/tasks/${testUserId}`);
            expect(res.status).toBeLessThan(500);

            const data = await res.json();
            expect(Array.isArray(data.tasks)).toBe(true);
        } catch (_) {
            throw new Error('Tasks service is not running on port 3010');
        }
    });
});
