import { User } from 'src/users/entity/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

@Entity({ name: 'words' })
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

  @Column({ name: 'english_meaning', nullable: true })
  englishMeaning: string;

  @Column({ name: 'description', nullable: true })
  description: string;

  @Column({ name: 'tags', nullable: true })
  tags: string;

  @Column({ name: 'is_active', default: false })
  isActive: boolean;

  @Column({ name: 'is_approved', default: false })
  isApproved: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
