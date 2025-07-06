import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity({ name: 'user_roles' })
export class UserRole {
  @PrimaryColumn()
  id: number;

  @Column()
  role: string;
}
