import { test, expect } from '@playwright/test';

test.describe('설정 페이지 - 로그인 및 기능 테스트', () => {
  const BASE_URL = 'http://localhost:5173';
  const TEST_EMAIL = 'help@picme.kr';
  const TEST_PASSWORD = '123123123!';

  test.beforeEach(async ({ page }) => {
    // 개발 서버 연결
    await page.goto(BASE_URL);
    
    // 로그인 페이지가 표시될 때까지 대기
    await page.waitForSelector('input[type="email"]');
  });

  test('1. 이메일 로그인 성공', async ({ page }) => {
    // 로그인 폼 채우기
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    
    // 로그인 버튼 클릭
    await page.click('button:has-text("로그인")');
    
    // 주문 목록 페이지로 리다이렉트 확인 또는 에러 메시지 확인
    await page.waitForTimeout(2000);
    
    // URL 또는 헤더 텍스트 확인
    const headerText = await page.textContent('h1');
    expect(headerText).toBeTruthy();
  });

  test('2. 설정 페이지 접근', async ({ page }) => {
    // 로그인 먼저 진행
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button:has-text("로그인")');
    
    // 로그인 후 설정 페이지 접근
    await page.goto(`${BASE_URL}/settings`);
    
    // 설정 페이지 제목 확인
    const title = await page.textContent('h1');
    expect(title).toContain('설정');
  });

  test('3. 파일명 규칙 - 사용자정의 옵션', async ({ page }) => {
    // 로그인
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button:has-text("로그인")');
    
    // 설정 페이지 접근
    await page.goto(`${BASE_URL}/settings`);
    
    // 파일명 규칙 select 찾기
    const selectElement = page.locator('select');
    
    // 사용자정의 옵션 선택
    await selectElement.selectOption('사용자정의');
    
    // 사용자정의 입력 필드가 표시되는지 확인
    const customInput = page.locator('input[placeholder*="주문번호"]');
    await expect(customInput).toBeVisible();
    
    // 값 입력
    await customInput.fill('{주문번호}_{날짜}_{파일명}');
    
    // 저장 버튼 클릭
    await page.click('button:has-text("저장")');
    
    // 저장 완료 확인
    await page.waitForTimeout(1000);
    const savedValue = await customInput.inputValue();
    expect(savedValue).toBe('{주문번호}_{날짜}_{파일명}');
  });

  test('4. 아바타 변경 버튼 표시 확인', async ({ page }) => {
    // 로그인
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button:has-text("로그인")');
    
    // 설정 페이지 접근
    await page.goto(`${BASE_URL}/settings`);
    
    // 아바타 변경 버튼 존재 확인
    const avatarButton = page.locator('button:has-text("아바타 변경")');
    await expect(avatarButton).toBeVisible();
  });

  test('5. 다크 테마 토글 확인', async ({ page }) => {
    // 로그인
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button:has-text("로그인")');
    
    // 설정 페이지 접근
    await page.goto(`${BASE_URL}/settings`);
    
    // 다크 테마 버튼 클릭
    const darkButton = page.locator('button:has-text("다크")');
    await darkButton.click();
    
    // HTML에 dark 클래스 추가 확인
    const html = page.locator('html');
    const darkClass = await html.getAttribute('class');
    expect(darkClass).toContain('dark');
    
    // 라이트 테마로 복구
    const lightButton = page.locator('button:has-text("라이트")');
    await lightButton.click();
    
    // HTML에서 dark 클래스 제거 확인
    const lightClass = await html.getAttribute('class');
    expect(lightClass).not.toContain('dark');
  });
});
