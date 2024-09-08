import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity({ name: 'user_role' })
export class UserRole {
  @PrimaryColumn()
  id: number;

  @Column()
  role: string;
}
