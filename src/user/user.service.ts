import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { User } from './entitity/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user-dto';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { SearchUserDto } from './dto/search-user-dto';
import { UserMappingDto } from './dto/user-mapping.dto';
import { UserRoleMapping } from './entitity/user-mappping.entity';
import { UserRole } from './entitity/user-role.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
    @InjectRepository(UserRoleMapping)
    private userRoleMappingRepository: Repository<UserRoleMapping>,
    private configService: ConfigService,
  ) {}

  private userQuery = [
    'user.id',
    'user.username',
    'user.email',
    'user.firstName',
    'user.lastName',
    'user.isActive',
    'user.createdAt',
    'user.updatedAt',
    'user.deletedAt',
  ];

  private async isExistingUser(userDto: CreateUserDto): Promise<boolean> {
    const { username, email } = userDto;
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .where('user.isActive = :isActive', { isActive: true });
    if (username) {
      queryBuilder.where('user.username = :username', { username });
    }
    if (email) {
      queryBuilder.where('user.email = :email', { email });
    }
    const dbUser = await queryBuilder.getOne();
    return dbUser !== null;
  }

  private async encryptPasswork(password) {
    const saltRounds = this.configService.get('SALT_ROUNDS');
    return bcrypt.hash(password, parseInt(saltRounds));
  }

  async createUser(dto: CreateUserDto): Promise<User> {
    const isExistingUser = await this.isExistingUser(dto);
    if (isExistingUser) throw new BadRequestException('User already exist');
    const user = this.userRepository.create(dto);
    user.password = await this.encryptPasswork(dto.password);
    return this.userRepository.save(user);
  }

  async search(@Query() dto: SearchUserDto): Promise<User[]> {
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .select(this.userQuery)
      .where('user.username ILIKE :query', { query: `%${dto.query}%` })
      .orWhere('user.email ILIKE :query', { query: `%${dto.query}%` });

    const offset = (dto.page - 1) * dto.size;
    queryBuilder.skip(offset).take(dto.size);
    return queryBuilder.getMany();
  }

  async updatedUserMapping(dto: UserMappingDto): Promise<{ success: boolean }> {
    const { userId, roleId, status } = dto;

    const userExists = await this.userRepository.findOneBy({
      id: userId,
      isActive: true,
    });
    if (!userExists) throw new NotFoundException('User not found');

    const roleExists = await this.userRoleRepository.findOneBy({
      id: roleId,
    });
    if (!roleExists) throw new NotFoundException('Role not found');

    const existingMapping = await this.userRoleMappingRepository.findOneBy({
      userId,
      roleId,
    });

    if (!existingMapping) {
      throw new ConflictException('Mapping does not exists');
    }
    await this.userRoleMappingRepository.update({ userId, roleId }, { status });
    return { success: true };
  }

  async createUserMapping(dto: UserMappingDto): Promise<UserRoleMapping> {
    const { userId, roleId } = dto;
    const userExists = await this.userRepository.findOneBy({
      id: userId,
      isActive: true,
    });
    if (!userExists) throw new NotFoundException('User not found');

    const roleExists = await this.userRoleRepository.findOneBy({
      id: roleId,
    });
    if (!roleExists) throw new NotFoundException('Role not found');

    const existingMapping = await this.userRoleMappingRepository.findOneBy({
      userId,
      roleId,
    });

    if (existingMapping) {
      throw new ConflictException('Mapping already exists');
    }

    const userRoleMappping = this.userRoleMappingRepository.create(dto);
    return this.userRoleMappingRepository.save(userRoleMappping);
  }

  findByUsername(username: string): Promise<User> {
    return this.userRepository.findOneBy({
      username: username,
      isActive: true,
    });
  }
}
