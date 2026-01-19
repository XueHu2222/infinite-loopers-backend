/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, jest, beforeEach, afterEach } from '@jest/globals';
import type { Request, Response, NextFunction } from 'express';

const mockUserFindFirst = jest.fn() as jest.Mock<() => Promise<any>>;
const mockUserCreate = jest.fn() as jest.Mock<() => Promise<any>>;
const mockUserFindUnique = jest.fn() as jest.Mock<() => Promise<any>>;
const mockBcryptHash = jest.fn() as jest.Mock<(password: string, salt: number) => Promise<string>>;
const mockBcryptCompare = jest.fn() as jest.Mock<(password: string, hash: string) => Promise<boolean>>;

jest.unstable_mockModule('@prisma/client', () => ({
    PrismaClient: jest.fn().mockImplementation(() => ({
        user: {
            findFirst: mockUserFindFirst,
            create: mockUserCreate,
            findUnique: mockUserFindUnique,
        },
    })),
}));

jest.unstable_mockModule('bcryptjs', () => ({
    default: {
        hash: mockBcryptHash,
        compare: mockBcryptCompare,
    },
}));

const auth = await import('../../src/controllers/authController.ts');
const { register, login } = auth;

let mockRequest: any;
let mockResponse: any;
let mockNext: NextFunction;

beforeEach(() => {
    mockRequest = { body: {} };
    mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        cookie: jest.fn(),
    } as any;

    mockNext = jest.fn();
    mockUserFindFirst.mockClear();
    mockUserCreate.mockClear();
    mockUserFindUnique.mockClear();
    mockBcryptHash.mockClear();
    mockBcryptCompare.mockClear();
});

afterEach(() => {
    jest.clearAllMocks();
});

// REGISTER TESTS

describe('register', () => {
    describe('Input Validation', () => {
        test('should return 400 when username is missing', async () => {
            mockRequest.body = { email: 'test@example.com', password: 'password123' };
            await register(mockRequest as Request, mockResponse as Response, mockNext);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ success: false, message: 'All fields are required' });
        });

        test('should return 400 when email is missing', async () => {
            mockRequest.body = { username: 'newuser', password: 'password123' };
            await register(mockRequest as Request, mockResponse as Response, mockNext);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ success: false, message: 'All fields are required' });
        });

        test('should return 400 when password is missing', async () => {
            mockRequest.body = { username: 'newuser', email: 'test@example.com' };
            await register(mockRequest as Request, mockResponse as Response, mockNext);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ success: false, message: 'All fields are required' });
        });
    });

    describe('User Existence Validation', () => {
        test('should return 400 and a message when user with same email or username already exists', async () => {
            mockRequest.body = { username: 'user123', email: 'new@example.com', password: 'password123' };

            mockUserFindFirst.mockResolvedValue({
                id: 1,
                username: 'user123',
                email: 'existing@example.com',
            });

            await register(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ success: false, message: 'Username aready taken try with another one' });
        });
    });

    describe('Successful Registration', () => {
        test('should create a new user and return 201', async () => {
            mockRequest.body = { username: 'newuser', email: 'new@example.com', password: 'password123' };
            const hashedPassword = 'hashed';
            const createdUser = { id: 1, username: 'newuser', email: 'new@example.com', password: hashedPassword };

            mockUserFindFirst.mockResolvedValue(null);
            mockBcryptHash.mockResolvedValue(hashedPassword);
            mockUserCreate.mockResolvedValue(createdUser);

            await register(mockRequest, mockResponse, mockNext);

            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                message: 'User registered successfully',
                user: { id: 1, username: 'newuser', email: 'new@example.com' },
            });

            expect(mockBcryptHash).toHaveBeenCalledWith('password123', expect.any(Number));
        });
    });

    describe('Error Handling', () => {
        test('should call next when DB findFirst fails', async () => {
            mockRequest.body = { username: 'test', email: 'test@example.com', password: '123' };
            const dbErr = new Error('DB findFirst failed');
            mockUserFindFirst.mockRejectedValue(dbErr);
            await register(mockRequest, mockResponse, mockNext);
            expect(mockNext).toHaveBeenCalledWith(dbErr);
        });

        test('should call next when bcrypt hash fails', async () => {
            mockRequest.body = { username: 'test', email: 'test@example.com', password: '123' };
            const hashErr = new Error('Bcrypt failed to hash');
            mockUserFindFirst.mockResolvedValue(null);
            mockBcryptHash.mockRejectedValue(hashErr);
            await register(mockRequest, mockResponse, mockNext);
            expect(mockResponse.status).not.toHaveBeenCalled();
            expect(mockNext).toHaveBeenCalledWith(hashErr);
        });

        test('should call next when DB user creation fails', async () => {
            mockRequest.body = { username: 'test', email: 'test@example.com', password: '123' };
            const createErr = new Error('Prisma failed to create user');
            const hashedPassword = 'hashed';
            mockUserFindFirst.mockResolvedValue(null);
            mockBcryptHash.mockResolvedValue(hashedPassword);
            mockUserCreate.mockRejectedValue(createErr);
            await register(mockRequest, mockResponse, mockNext);
            expect(mockResponse.status).not.toHaveBeenCalled();
            expect(mockNext).toHaveBeenCalledWith(createErr);
        });
    });
});

// LOGIN TESTS

describe('login', () => {
    const testUser = {
        id: 1,
        username: 'loginuser',
        email: 'login@example.com',
        password: 'hashedpassword',
    };

    describe('Input Validation', () => {
        test('should return 400 when email is missing', async () => {
            mockRequest.body = { password: 'password123' };
            await login(mockRequest as Request, mockResponse as Response, mockNext);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ success: false, message: 'Email and password are required' });
        });

        test('should return 400 when password is missing', async () => {
            mockRequest.body = { email: 'login@example.com' };
            await login(mockRequest as Request, mockResponse as Response, mockNext);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ success: false, message: 'Email and password are required' });
        });
    });

    describe('Authentication Failure', () => {
        test('should return 401 if user is not found', async () => {
            mockRequest.body = { email: 'unknown@example.com', password: 'password123' };
            mockUserFindUnique.mockResolvedValue(null);

            await login(mockRequest, mockResponse, mockNext);

            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({ success: false, message: 'Invalid credentials' });
            expect(mockBcryptCompare).not.toHaveBeenCalled();
        });

        test('should return 401 if password comparison fails', async () => {
            mockRequest.body = { email: testUser.email, password: 'wrongpassword' };
            mockUserFindUnique.mockResolvedValue(testUser);
            mockBcryptCompare.mockResolvedValue(false);

            await login(mockRequest, mockResponse, mockNext);

            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({ success: false, message: 'Invalid credentials' });
            expect(mockBcryptCompare).toHaveBeenCalledWith('wrongpassword', testUser.password);
        });
    });

    describe('Successful Login', () => {
        test('should return 200 and user data on successful login', async () => {
            mockRequest.body = { email: testUser.email, password: 'correctpassword' };
            mockUserFindUnique.mockResolvedValue(testUser);
            mockBcryptCompare.mockResolvedValue(true);

            await login(mockRequest, mockResponse, mockNext);

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                message: 'Login successful',
                user: { id: testUser.id, username: testUser.username, email: testUser.email },
            });
            expect(mockBcryptCompare).toHaveBeenCalledWith('correctpassword', testUser.password);
        });
    });

    describe('Error Handling', () => {
        test('should call next when DB findUnique fails', async () => {
            mockRequest.body = { email: testUser.email, password: 'password123' };
            const dbErr = new Error('DB findUnique failed');
            mockUserFindUnique.mockRejectedValue(dbErr);

            await login(mockRequest, mockResponse, mockNext);

            expect(mockNext).toHaveBeenCalledWith(dbErr);
            expect(mockResponse.status).not.toHaveBeenCalled();
        });

        test('should call next when bcrypt compare fails', async () => {
            mockRequest.body = { email: testUser.email, password: 'password123' };
            const compareErr = new Error('Bcrypt compare failed');
            mockUserFindUnique.mockResolvedValue(testUser);
            mockBcryptCompare.mockRejectedValue(compareErr);

            await login(mockRequest, mockResponse, mockNext);

            expect(mockNext).toHaveBeenCalledWith(compareErr);
            expect(mockResponse.status).not.toHaveBeenCalled();
        });
    });
});
