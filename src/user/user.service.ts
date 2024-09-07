import { BadRequestException, Injectable, Query } from '@nestjs/common';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user-dto';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { SearchUserDto } from './dto/search-user-dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private configService: ConfigService,
  ) {}

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
      .where('user.username ILIKE :query', { query: `%${dto.query}%` })
      .orWhere('user.email ILIKE :query', { query: `%${dto.query}%` });

    const offset = (dto.page - 1) * dto.size;
    queryBuilder.skip(offset).take(dto.size);
    return queryBuilder.getMany();
  }

  findAll(): Promise<User[]> {
    return this.userRepository.find({
      select: {
        id: true,
        username: true,
        password: true,
      },
      where: {
        isActive: true,
      },
    });
  }

  findByUsername(username: string): Promise<User> {
    return this.userRepository.findOne({
      select: {
        id: true,
        username: true,
        password: true,
      },
      where: {
        username: username,
        isActive: true,
      },
    });
  }
}
