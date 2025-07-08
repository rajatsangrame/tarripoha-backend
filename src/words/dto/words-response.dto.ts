import { Expose } from 'class-transformer';

export class WordResponseDto {
  @Expose({ name: 'id' })
  id: number;

  @Expose({ name: 'language_id' })
  languageId: number;

  @Expose({ name: 'user_id' })
  userId: number;

  @Expose({ name: 'name' })
  name: string;

  @Expose({ name: 'meaning' })
  meaning: string;

  @Expose({ name: 'english_meaning' })
  englishMeaning: string;

  @Expose({ name: 'description' })
  description: string;

  @Expose({ name: 'tags' })
  tags: string;

  @Expose({ name: 'is_active' })
  isActive: boolean;

  @Expose({ name: 'is_approved' })
  isApproved: boolean;

  @Expose({ name: 'is_liked' })
  isLiked: boolean;

  @Expose({ name: 'is_saved' })
  isSaved: boolean;

  @Expose({ name: 'created_at' })
  createdAt: Date;

  @Expose({ name: 'updated_at' })
  updatedAt: Date;

  @Expose({ name: 'saved_at' })
  savedAt: Date;

  user: any;
}
