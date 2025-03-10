import { Expose } from 'class-transformer';

export class WordResponseDto {
  @Expose({ name: 'word_id' })
  id: number;

  @Expose({ name: 'word_language_id' })
  languageId: number;

  @Expose({ name: 'word_user_id' })
  userId: number;

  @Expose({ name: 'word_name' })
  name: string;

  @Expose({ name: 'word_meaning' })
  meaning: string;

  @Expose({ name: 'word_english_meaning' })
  englishMeaning: string;

  @Expose({ name: 'word_description' })
  description: string;

  @Expose({ name: 'word_is_active' })
  isActive: boolean;

  @Expose({ name: 'word_is_approved' })
  isApproved: boolean;

  @Expose({ name: 'is_liked' })
  isLiked: boolean;

  @Expose({ name: 'is_saved' })
  isSaved: boolean;

  @Expose({ name: 'word_created_at' })
  createdAt: Date;

  @Expose({ name: 'word_updated_at' })
  updatedAt: Date;
}
