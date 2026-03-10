/**
 * DiceBear API를 사용한 아바타 URL 생성 유틸리티
 * 
 * DiceBear는 완전히 무료인 아바타 생성 API입니다.
 * 사용자별 고유한 아바타를 일관되게 생성합니다.
 * 
 * @see https://www.dicebear.com/
 */

/**
 * 사용자 UID를 기반으로 DiceBear 아바타 URL 생성
 * @param userId - 사용자 고유 ID (Firebase UID 권장)
 * @param scale - 이미지 스케일 (기본값: 200)
 * @returns DiceBear 아바타 URL
 */
export const getDiceBearAvatarUrl = (
  userId: string | undefined,
  scale: number = 200
): string => {
  const seed = userId?.slice(0, 8) || 'default';
  return `https://api.dicebear.com/7.x/notionists/svg?scale=${scale}&seed=${seed}`;
};

/**
 * 사용자의 프로필 이미지 URL을 반환
 * 실제 photoURL이 있으면 사용, 없으면 DiceBear 아바타 생성
 * 
 * @param photoURL - 사용자 업로드 프로필 이미지 URL
 * @param userId - 사용자 고유 ID
 * @param scale - 이미지 스케일 (기본값: 200)
 * @returns 최종 프로필 이미지 URL
 */
export const getProfileImageUrl = (
  photoURL: string | null | undefined,
  userId: string | undefined,
  scale: number = 200
): string => {
  if (photoURL) {
    return photoURL;
  }
  return getDiceBearAvatarUrl(userId, scale);
};
