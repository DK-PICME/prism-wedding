import { PrismHeader } from '../components/PrismHeader';
import { PrismFooter } from '../components/PrismFooter';

export const SignUpPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <main className="pt-[73px]">
        <div className="px-8 py-8">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-neutral-800 to-neutral-600 rounded-lg mx-auto mb-6">
              <i className="fa-solid fa-gem text-white text-lg"></i>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-2xl text-neutral-900 mb-2">회원가입</h1>
              <p className="text-neutral-600">Prism Studio에 가입하여 사진 보정 서비스를 시작하세요</p>
            </div>

            <div className="bg-white border border-neutral-200 rounded-2xl p-8">
              <form className="space-y-4">
                <div>
                  <label className="block text-sm text-neutral-700 mb-2">스튜디오명</label>
                  <input
                    type="text"
                    placeholder="예: 웨딩 스튜디오"
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-sm text-neutral-700 mb-2">이메일 주소</label>
                  <input
                    type="email"
                    placeholder="wedding@example.com"
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-sm text-neutral-700 mb-2">비밀번호</label>
                  <input
                    type="password"
                    placeholder="8자 이상, 숫자, 특수문자 포함"
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-sm text-neutral-700 mb-2">비밀번호 확인</label>
                  <input
                    type="password"
                    placeholder="비밀번호를 다시 입력해주세요"
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-start gap-2 p-3 border border-neutral-300 rounded-lg cursor-pointer hover:bg-neutral-50">
                    <input type="checkbox" className="w-4 h-4 mt-0.5" />
                    <span className="text-sm text-neutral-600">
                      <a href="#" className="text-neutral-900 font-semibold hover:underline">이용약관</a>에 동의합니다
                    </span>
                  </label>

                  <label className="flex items-start gap-2 p-3 border border-neutral-300 rounded-lg cursor-pointer hover:bg-neutral-50">
                    <input type="checkbox" className="w-4 h-4 mt-0.5" />
                    <span className="text-sm text-neutral-600">
                      <a href="#" className="text-neutral-900 font-semibold hover:underline">개인정보처리방침</a>에 동의합니다
                    </span>
                  </label>

                  <label className="flex items-start gap-2 p-3 border border-neutral-300 rounded-lg cursor-pointer hover:bg-neutral-50">
                    <input type="checkbox" className="w-4 h-4 mt-0.5" />
                    <span className="text-sm text-neutral-600">마케팅 정보 수신에 동의합니다 (선택)</span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg transition-colors font-medium"
                >
                  회원가입
                </button>
              </form>

              <div className="mt-6 space-y-3">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-neutral-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-neutral-600">또는</span>
                  </div>
                </div>

                <button className="w-full px-4 py-3 border border-neutral-300 hover:bg-neutral-50 rounded-lg transition-colors flex items-center justify-center gap-2 text-neutral-900">
                  <i className="fa-brands fa-google text-lg"></i>
                  Google로 가입
                </button>

                <button className="w-full px-4 py-3 border border-neutral-300 hover:bg-neutral-50 rounded-lg transition-colors flex items-center justify-center gap-2 text-neutral-900">
                  <i className="fa-brands fa-naver text-lg"></i>
                  네이버로 가입
                </button>
              </div>
            </div>

            <div className="text-center mt-6">
              <p className="text-sm text-neutral-600">
                이미 계정이 있으신가요?{' '}
                <a href="#" className="text-neutral-900 font-semibold hover:underline">
                  로그인
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
