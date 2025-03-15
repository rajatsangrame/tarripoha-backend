import { Expose, Transform } from 'class-transformer';

export class CommentResponseDto {
  @Expose({ name: 'id' })
  id: number;

  @Expose({ name: 'text' })
  text: string;

  @Expose({ name: 'content_id' })
  contentId: string;

  @Expose({ name: 'content_type' })
  contentType: number;

  @Expose({ name: 'is_active' })
  isActive: boolean;

  @Expose({ name: 'is_liked' })
  isLiked: boolean;

  @Expose({ name: 'created_at' })
  createdAt: Date;

  @Expose({ name: 'updated_at' })
  updatedAt: Date;

  @Expose()
  @Transform(({ obj }) => ({
    id: obj.user_id,
    username: obj.username,
    firstName: obj.first_name,
    lastName: obj.last_name,
  }))
  user: {
    userId: number;
    username: string;
    firstName: string;
    lastName: string;
  };
}
