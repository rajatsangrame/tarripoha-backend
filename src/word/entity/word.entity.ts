import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Language } from './language.entity';
import { User } from 'src/user/entity/user.entity';

@Entity({ name: 'word' })
export class Word {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'language_id' })
  languageId: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'meaning' })
  meaning: string;

  @Column({ name: 'description', nullable: true })
  description: string;

  @Column({ name: 'is_active', default: false })
  isActive: boolean;

  @Column({ name: 'is_approved', default: false })
  isApproved: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Language, { eager: true })
  @JoinColumn({ name: 'language_id' })
  language: Language;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
