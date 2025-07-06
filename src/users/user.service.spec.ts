import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { User } from './entity/user.entity';
import { UserRole } from './entity/user-role.entity';
import { UserRoleMapping } from './entity/user-mappping.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

const mockUserRepository = {
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  createQueryBuilder: jest.fn(),
};

const mockUserRoleRepository = {
  findOneBy: jest.fn(),
};

const mockUserRoleMappingRepository = {
  findOneBy: jest.fn(),
  insert: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  findBy: jest.fn(),
};

const mockConfigService = {
  get: jest.fn().mockReturnValue('10'),
};

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        {
          provide: getRepositoryToken(UserRole),
          useValue: mockUserRoleRepository,
        },
        {
          provide: getRepositoryToken(UserRoleMapping),
          useValue: mockUserRoleMappingRepository,
        },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('should throw BadRequestException if the user already exists', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValueOnce({}),
      };

      mockUserRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await expect(
        service.createUser({
          username: 'test',
          email: 'test@test.com',
          password: '12345',
        }),
      ).rejects.toThrow(BadRequestException);
      expect(mockUserRepository.createQueryBuilder).toHaveBeenCalled();
    });

    it('should save the user and return the created user', async () => {
      const dto = {
        id: 1,
        username: 'test',
        email: 'test@test.com',
        password: '12345',
      };
      mockUserRepository.createQueryBuilder.mockReturnValueOnce({
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValueOnce(null),
      });
      mockUserRepository.create.mockReturnValue(dto);
      mockUserRepository.save.mockResolvedValue({ id: 1, ...dto });
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed_password');

      const result = await service.createUser(dto);
      expect(result).toEqual({ id: 1, ...dto, password: 'hashed_password' });
      expect(mockUserRepository.save).toHaveBeenCalled();
    });
  });

  describe('updatedUserMapping', () => {
    it('should throw NotFoundException if the user does not exist', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);

      await expect(
        service.updatedUserMapping({ userId: 1, roleId: 1, status: true }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if the role does not exist', async () => {
      mockUserRepository.findOneBy.mockResolvedValue({ id: 1 });
      mockUserRoleRepository.findOneBy.mockResolvedValue(null);

      await expect(
        service.updatedUserMapping({ userId: 1, roleId: 1, status: true }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update the user-role mapping', async () => {
      mockUserRepository.findOneBy.mockResolvedValue({ id: 1 });
      mockUserRoleRepository.findOneBy.mockResolvedValue({ id: 1 });
      mockUserRoleMappingRepository.findOneBy.mockResolvedValue({
        userId: 1,
        roleId: 1,
      });

      const result = await service.updatedUserMapping({
        userId: 1,
        roleId: 1,
        status: true,
      });
      expect(result).toEqual({ success: true });
      expect(mockUserRoleMappingRepository.update).toHaveBeenCalledWith(
        { userId: 1, roleId: 1 },
        { status: true },
      );
    });
  });

  describe('search', () => {
    it('should return a list of users matching the query', async () => {
      const queryBuilderMock = {
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest
          .fn()
          .mockResolvedValue([{ username: 'test', email: 'test@test.com' }]),
      };
      mockUserRepository.createQueryBuilder.mockReturnValue(queryBuilderMock);

      const result = await service.search({ query: 'test', page: 1, size: 10 });
      expect(result).toEqual([{ username: 'test', email: 'test@test.com' }]);
    });
  });
});
