import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserRole } from './user-role.entity';

@Entity({ name: 'user_role_mapping' })
export class UserRoleMapping {
  @PrimaryColumn({ name: 'user_id' })
  userId: number;

  @PrimaryColumn({ name: 'role_id' })
  roleId: number;

  @Column({ name: 'status', default: true })
  status: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;

  @ManyToOne(() => UserRole, { eager: true })
  @JoinColumn({ name: 'role_id' })
  userRole: UserRole;

  get roleName(): string {
    return this.userRole.role;
  }
}
