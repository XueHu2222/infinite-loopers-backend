import { describe, it, expect } from '@jest/globals';

describe('Smoke test - users service', () => {
    it('auth login endpoint responds', async () => {
        try {
            const res = await fetch('http://localhost:3012/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: 'smoke@test.com', password: '123456' })
            });
            expect(res.status).toBeLessThan(500);
        } catch (err) {
            console.log(err);
            throw new Error('Users service is not running on port 3012');
        }
    });
});
