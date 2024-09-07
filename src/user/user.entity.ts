import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'user' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'first_name', nullable: true })
  firstName: string;

  @Column({ name: 'last_name', nullable: true })
  lastName: string;

  @Column()
  password: string;

  @Column({ nullable: true, unique: true })
  email: string;

  @Column()
  username: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}
