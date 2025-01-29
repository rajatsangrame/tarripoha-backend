import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcryptjs';
import { User } from '../user/entity/user.entity';
import { UserRoleMapping } from '../user/entity/user-mappping.entity';

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: JwtService;
  let userService: UserService;

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockUserService = {
    findUserBy: jest.fn(),
    getUserRoles: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
    expect(jwtService).toBeDefined();
    expect(userService).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return a user if credentials are valid', async () => {
      const mockUser: User = {
        id: 1,
        username: 'testuser',
        password: 'hashedpassword',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        roles: [],
      };

      mockUserService.findUserBy.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      const result = await authService.validateUser('testuser', 'password');
      expect(result).toEqual(mockUser);
      expect(mockUserService.findUserBy).toHaveBeenCalledWith(
        { username: 'testuser' },
        ['id', 'username', 'password'],
      );
    });

    it('should return null if credentials are invalid', async () => {
      mockUserService.findUserBy.mockResolvedValue(null);

      const result = await authService.validateUser('testuser', 'password');
      expect(result).toBeNull();
      expect(mockUserService.findUserBy).toHaveBeenCalledWith(
        { username: 'testuser' },
        ['id', 'username', 'password'],
      );
    });
  });

  describe('getUserRoles', () => {
    it('should return user roles', async () => {
      const mockRoles: UserRoleMapping = {
        userId: 1,
        roleId: 2,
        status: true,
        createdAt: new Date('2025-01-01T10:00:00Z'),
        updatedAt: new Date('2025-01-10T15:00:00Z'),
        deletedAt: null,
        userRole: {
          id: 2,
          role: 'ADMIN',
        },
        get roleName() {
          return this.userRole.role;
        },
      };

      mockUserService.getUserRoles.mockResolvedValue(mockRoles);

      const result = await authService.getUserRoles(1);
      expect(result).toEqual(mockRoles);
      expect(mockUserService.getUserRoles).toHaveBeenCalledWith(1);
    });
  });

  describe('login', () => {
    it('should return an access token', async () => {
      const mockUser: User = {
        id: 1,
        username: 'testuser',
        password: 'hashedpassword',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        roles: ['USER'],
      };

      const mockToken = 'mockAccessToken';
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await authService.login(mockUser);
      expect(result).toEqual({ accessToken: mockToken });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        username: mockUser.username,
        email: mockUser.email,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        roles: mockUser.roles,
      });
    });
  });
});
