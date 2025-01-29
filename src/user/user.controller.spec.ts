import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../guard/auth/jwt.auth.guard';
import { RolesGuard } from '../guard/role/user-role.guard';
import { CreateUserDto } from './dto/create-user-dto';
import { SearchUserDto } from './dto/search-user-dto';
import { UserMappingDto } from './dto/user-mapping.dto';
import { User } from './entity/user.entity';
import { UserRoleMapping } from './entity/user-mappping.entity';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  const mockUserService = {
    createUser: jest.fn(),
    search: jest.fn(),
    createUserMapping: jest.fn(),
    updatedUserMapping: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createUser', () => {
    it('should call createUser service and return a user', async () => {
      const dto: CreateUserDto = {
        username: 'testUser',
        email: 'test@example.com',
        password: 'password123',
      };
      const createdUser: User = { id: 1, ...dto, isActive: true } as User;

      mockUserService.createUser.mockResolvedValue(createdUser);

      const result = await controller.createUser(dto);

      expect(userService.createUser).toHaveBeenCalledWith(dto);
      expect(result).toEqual(createdUser);
    });
  });

  describe('search', () => {
    it('should call search service and return users', async () => {
      const dto: SearchUserDto = { query: 'testUser', page: 1, size: 10 };
      const users: User[] = [{ id: 1, username: 'testUser' } as User];

      mockUserService.search.mockResolvedValue(users);

      const result = await controller.search(dto);

      expect(userService.search).toHaveBeenCalledWith(dto);
      expect(result).toEqual(users);
    });
  });

  describe('createUserMapping', () => {
    it('should call createUserMapping service and return a mapping', async () => {
      const dto: UserMappingDto = { userId: 1, roleId: 2, status: true };
      const mapping: UserRoleMapping = {
        userId: 1,
        roleId: 2,
        status: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as UserRoleMapping;

      mockUserService.createUserMapping.mockResolvedValue(mapping);

      const result = await controller.createUserMapping(dto);

      expect(userService.createUserMapping).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mapping);
    });
  });

  describe('updatedUserMapping', () => {
    it('should call updatedUserMapping service and return success', async () => {
      const dto: UserMappingDto = { userId: 1, roleId: 2, status: true };

      mockUserService.updatedUserMapping.mockResolvedValue({ success: true });

      const result = await controller.updatedUserMapping(dto);

      expect(userService.updatedUserMapping).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ success: true });
    });
  });
});
