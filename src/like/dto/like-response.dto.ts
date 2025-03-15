export class LikeResponseDto {
  userID: number;
  contentId: number;
  contentType: number;
  totalLikes: number;
  isActive: boolean;

  constructor(
    userId: number,
    contentId: number,
    contentType: number,
    totalLikes: number,
    isActive: boolean,
  ) {
    this.userID = userId;
    this.contentId = contentId;
    this.contentType = contentType;
    this.totalLikes = totalLikes;
    this.isActive = isActive;
  }
}
