import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PrismFooter } from '../components/PrismFooter';
import { useAuth } from '../contexts/AuthContext';

export const PasswordRecoveryPage = () => {
  const navigate = useNavigate();
  const { resetPassword, error: authError } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!email.trim()) {
      setError('이메일을 입력해주세요');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('유효한 이메일 주소를 입력해주세요');
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(email);
      setSuccess(true);
      setEmail('');
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        setError('등록되지 않은 이메일입니다');
      } else if (err.code === 'auth/invalid-email') {
        setError('유효하지 않은 이메일입니다');
      } else {
        setError(err.message || '재설정 링크 전송에 실패했습니다');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center px-8 py-8">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-neutral-800 to-neutral-600 rounded-lg mx-auto mb-6">
            <i className="fa-solid fa-gem text-white text-lg"></i>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl text-neutral-900 mb-2">비밀번호 찾기</h1>
            <p className="text-neutral-600">등록된 이메일로 비밀번호 재설정 링크를 보내드립니다</p>
          </div>

          <div className="bg-white border border-neutral-200 rounded-2xl p-8">
            {(error || authError) && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error || authError}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                비밀번호 재설정 링크가 이메일로 전송되었습니다. 이메일을 확인해주세요.
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm text-neutral-700 mb-2">이메일 주소</label>
                <input
                  type="email"
                  placeholder="wedding@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 disabled:bg-neutral-100"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg transition-colors font-medium disabled:bg-neutral-500"
              >
                {isLoading ? '전송 중...' : '재설정 링크 전송'}
              </button>

              <div className="relative py-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-neutral-600">또는</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate('/login')}
                className="block w-full px-6 py-3 border border-neutral-300 hover:bg-neutral-50 text-neutral-900 rounded-lg transition-colors text-center font-medium cursor-pointer"
              >
                로그인으로 돌아가기
              </button>
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
              <button
                onClick={() => navigate('/sign-up')}
                className="text-neutral-900 font-semibold hover:underline cursor-pointer"
              >
                회원가입
              </button>
            </p>
          </div>
        </div>
      </main>
      <PrismFooter />
    </div>
  );
};
