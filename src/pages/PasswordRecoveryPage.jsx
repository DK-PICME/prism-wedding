import { PrismHeader } from '../components/PrismHeader';
import { PrismFooter } from '../components/PrismFooter';

export const PasswordRecoveryPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <main className="pt-[73px]">
        <div className="px-8 py-8">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-neutral-800 to-neutral-600 rounded-lg mx-auto mb-6">
              <i className="fa-solid fa-gem text-white text-lg"></i>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-2xl text-neutral-900 mb-2">비밀번호 찾기</h1>
              <p className="text-neutral-600">등록된 이메일로 비밀번호 재설정 링크를 보내드립니다</p>
            </div>

            <div className="bg-white border border-neutral-200 rounded-2xl p-8">
              <form className="space-y-4">
                <div>
                  <label className="block text-sm text-neutral-700 mb-2">이메일 주소</label>
                  <input
                    type="email"
                    placeholder="wedding@example.com"
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg transition-colors font-medium"
                >
                  재설정 링크 전송
                </button>

                <div className="relative py-3">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-neutral-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-neutral-600">또는</span>
                  </div>
                </div>

                <a href="?page=order-list" className="block w-full px-6 py-3 border border-neutral-300 hover:bg-neutral-50 text-neutral-900 rounded-lg transition-colors text-center font-medium cursor-pointer">
                  로그인으로 돌아가기
                </a>
              </form>

              <div className="mt-6 p-4 bg-neutral-50 rounded-lg">
                <p className="text-sm text-neutral-600">
                  <i className="fa-solid fa-info-circle mr-2"></i>
                  이메일을 받지 못하셨나요? 스팸 폴더를 확인해주세요.
                </p>
              </div>
            </div>

            <div className="text-center mt-6">
              <p className="text-sm text-neutral-600">
                계정이 없으신가요?{' '}
                <a href="?page=sign-up" className="text-neutral-900 font-semibold hover:underline cursor-pointer">
                  회원가입
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
