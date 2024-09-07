import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user-dto';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';

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

  async createUser(userDto: CreateUserDto): Promise<User> {
    const isExistingUser = await this.isExistingUser(userDto);
    if (isExistingUser) throw new BadRequestException('User already exist');
    const user = this.userRepository.create(userDto);
    user.password = await this.encryptPasswork(userDto.password);
    return this.userRepository.save(user);
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
