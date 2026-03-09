import { test, expect } from '@playwright/test';

test.describe('인증 플로우 테스트 - Phase 1', () => {
  test('테스트 1: 미로그인 사용자가 보호된 페이지 접근 시 로그인 페이지로 리다이렉트', async ({ page }) => {
    // /order-list에 직접 접근 시도
    await page.goto('/order-list');
    
    // /login으로 리다이렉트되어야 함
    await expect(page).toHaveURL('/login');
    expect(await page.locator('text=로그인').first().isVisible()).toBe(true);
  });

  test('테스트 2: 미로그인 사용자가 /upload 접근 시 로그인 페이지로 리다이렉트', async ({ page }) => {
    // /upload에 직접 접근 시도
    await page.goto('/upload');
    
    // /login으로 리다이렉트되어야 함
    await expect(page).toHaveURL('/login');
    expect(await page.locator('text=로그인').first().isVisible()).toBe(true);
  });

  test('테스트 3: 미로그인 사용자가 /status 접근 시 로그인 페이지로 리다이렉트', async ({ page }) => {
    // /status에 직접 접근 시도
    await page.goto('/status');
    
    // /login으로 리다이렉트되어야 함
    await expect(page).toHaveURL('/login');
    expect(await page.locator('text=로그인').first().isVisible()).toBe(true);
  });

  test('테스트 4: 로그인 페이지 UI 검증', async ({ page }) => {
    // 로그인 페이지 접근
    await page.goto('/login');
    
    // 필수 요소 확인
    expect(await page.locator('text=로그인').first().isVisible()).toBe(true);
    expect(await page.locator('[type=email]').isVisible()).toBe(true);
    expect(await page.locator('[type=password]').isVisible()).toBe(true);
    expect(await page.locator('text=Google로 로그인').isVisible()).toBe(true);
    expect(await page.locator('text=회원가입').isVisible()).toBe(true);
  });

  test('테스트 5: 로그인 폼 유효성 검사 - 빈 필드', async ({ page }) => {
    // 로그인 페이지 접근
    await page.goto('/login');
    
    // 로그인 버튼 클릭 (빈 필드)
    await page.click('button:has-text("로그인")');
    
    // 에러 메시지 확인
    await expect(page.locator('text=이메일을 입력해주세요')).toBeVisible();
  });

  test('테스트 6: 로그인 폼 유효성 검사 - 유효하지 않은 이메일', async ({ page }) => {
    // 로그인 페이지 접근
    await page.goto('/login');
    
    // 유효하지 않은 이메일 입력
    await page.fill('[type=email]', 'invalidemail');
    await page.click('button:has-text("로그인")');
    
    // 에러 메시지 확인
    await expect(page.locator('text=유효한 이메일 주소를 입력해주세요')).toBeVisible();
  });

  test('테스트 7: 회원가입 페이지 UI 검증', async ({ page }) => {
    // 회원가입 페이지 접근
    await page.goto('/sign-up');
    
    // 필수 요소 확인
    expect(await page.locator('text=회원가입').first().isVisible()).toBe(true);
    expect(await page.locator('[type=text]').first().isVisible()).toBe(true); // 스튜디오명
    expect(await page.locator('[type=email]').isVisible()).toBe(true);
    expect(await page.locator('[type=password]').isVisible()).toBe(true);
    expect(await page.locator('text=이용약관').isVisible()).toBe(true);
    expect(await page.locator('text=로그인').isVisible()).toBe(true);
  });

  test('테스트 8: 회원가입 폼 유효성 검사 - 비밀번호 길이', async ({ page }) => {
    // 회원가입 페이지 접근
    await page.goto('/sign-up');
    
    // 폼 작성
    await page.fill('input[name=studioName]', 'Test Studio');
    await page.fill('input[name=email]', 'test@example.com');
    await page.fill('input[name=password]', 'short1!'); // 7자 (8자 미만)
    
    // 회원가입 버튼 클릭
    await page.click('button:has-text("회원가입")');
    
    // 에러 메시지 확인
    await expect(page.locator('text=비밀번호는 8자 이상이어야 합니다')).toBeVisible();
  });

  test('테스트 9: 회원가입 폼 유효성 검사 - 비밀번호 특수문자 없음', async ({ page }) => {
    // 회원가입 페이지 접근
    await page.goto('/sign-up');
    
    // 폼 작성
    await page.fill('input[name=studioName]', 'Test Studio');
    await page.fill('input[name=email]', 'test@example.com');
    await page.fill('input[name=password]', 'password123'); // 특수문자 없음
    
    // 회원가입 버튼 클릭
    await page.click('button:has-text("회원가입")');
    
    // 에러 메시지 확인
    await expect(page.locator('text=비밀번호에 특수문자를 포함해주세요')).toBeVisible();
  });

  test('테스트 10: 회원가입 폼 유효성 검사 - 비밀번호 불일치', async ({ page }) => {
    // 회원가입 페이지 접근
    await page.goto('/sign-up');
    
    // 폼 작성
    await page.fill('input[name=studioName]', 'Test Studio');
    await page.fill('input[name=email]', 'test@example.com');
    await page.fill('input[name=password]', 'Password123!');
    await page.fill('input[name=passwordConfirm]', 'Password456!'); // 다른 비밀번호
    
    // 회원가입 버튼 클릭
    await page.click('button:has-text("회원가입")');
    
    // 에러 메시지 확인
    await expect(page.locator('text=비밀번호가 일치하지 않습니다')).toBeVisible();
  });

  test('테스트 11: 회원가입 폼 유효성 검사 - 이용약관 미동의', async ({ page }) => {
    // 회원가입 페이지 접근
    await page.goto('/sign-up');
    
    // 폼 작성 (약관 미동의)
    await page.fill('input[name=studioName]', 'Test Studio');
    await page.fill('input[name=email]', 'test@example.com');
    await page.fill('input[name=password]', 'Password123!');
    await page.fill('input[name=passwordConfirm]', 'Password123!');
    
    // 회원가입 버튼 클릭
    await page.click('button:has-text("회원가입")');
    
    // 에러 메시지 확인
    await expect(page.locator('text=이용약관과 개인정보처리방침에 동의해주세요')).toBeVisible();
  });

  test('테스트 12: 비밀번호 찾기 페이지 UI 검증', async ({ page }) => {
    // 로그인 페이지 접근
    await page.goto('/login');
    
    // 비밀번호 찾기 링크 클릭
    await page.click('text=비밀번호 찾기');
    
    // 비밀번호 찾기 페이지 URL 확인
    await expect(page).toHaveURL('/password-recovery');
    
    // 필수 요소 확인
    expect(await page.locator('text=비밀번호 찾기').first().isVisible()).toBe(true);
    expect(await page.locator('[type=email]').isVisible()).toBe(true);
    expect(await page.locator('text=재설정 링크 전송').isVisible()).toBe(true);
  });

  test('테스트 13: 비밀번호 찾기 폼 유효성 검사 - 빈 필드', async ({ page }) => {
    // 비밀번호 찾기 페이지 접근
    await page.goto('/password-recovery');
    
    // 재설정 링크 전송 버튼 클릭 (빈 필드)
    await page.click('button:has-text("재설정 링크 전송")');
    
    // 에러 메시지 확인
    await expect(page.locator('text=이메일을 입력해주세요')).toBeVisible();
  });

  test('테스트 14: 로그인 → 회원가입 네비게이션', async ({ page }) => {
    // 로그인 페이지 접근
    await page.goto('/login');
    
    // 회원가입 링크 클릭
    await page.click('text=회원가입');
    
    // 회원가입 페이지로 이동 확인
    await expect(page).toHaveURL('/sign-up');
  });

  test('테스트 15: 회원가입 → 로그인 네비게이션', async ({ page }) => {
    // 회원가입 페이지 접근
    await page.goto('/sign-up');
    
    // 로그인 링크 클릭
    await page.click('text=로그인');
    
    // 로그인 페이지로 이동 확인
    await expect(page).toHaveURL('/login');
  });

  test('테스트 16: 로그인 페이지에서 PrismHeader 표시', async ({ page }) => {
    // 로그인 페이지 접근
    await page.goto('/login');
    
    // PrismHeader 요소 확인 (header 태그 확인)
    const header = page.locator('header');
    expect(await header.isVisible()).toBe(true);
  });

  test('테스트 17: 회원가입 페이지에서 PrismHeader 표시', async ({ page }) => {
    // 회원가입 페이지 접근
    await page.goto('/sign-up');
    
    // PrismHeader 요소 확인 (header 태그 확인)
    const header = page.locator('header');
    expect(await header.isVisible()).toBe(true);
  });

  test('테스트 18: 로그인 페이지에서 PrismFooter 표시', async ({ page }) => {
    // 로그인 페이지 접근
    await page.goto('/login');
    
    // PrismFooter 요소 확인 (footer 태그 확인)
    const footer = page.locator('footer');
    expect(await footer.isVisible()).toBe(true);
  });

  test('테스트 19: 루트 경로 / 접근 시 /login으로 리다이렉트', async ({ page }) => {
    // 루트 경로 접근
    await page.goto('/');
    
    // /login으로 리다이렉트되어야 함
    await expect(page).toHaveURL('/login');
  });

  test('테스트 20: 존재하지 않는 경로 접근 시 /login으로 리다이렉트', async ({ page }) => {
    // 존재하지 않는 경로 접근
    await page.goto('/nonexistent-page');
    
    // /login으로 리다이렉트되어야 함
    await expect(page).toHaveURL('/login');
  });
});
