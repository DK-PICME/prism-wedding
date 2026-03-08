import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PrismHeader } from '../components/PrismHeader';
import { PrismFooter } from '../components/PrismFooter';
import { useAuth } from '../contexts/AuthContext';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, error: authError } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      setError('이메일을 입력해주세요');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('유효한 이메일 주소를 입력해주세요');
      return false;
    }

    if (!formData.password) {
      setError('비밀번호를 입력해주세요');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await login(formData.email, formData.password);
      navigate('/order-list');
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        setError('등록되지 않은 이메일입니다');
      } else if (err.code === 'auth/wrong-password') {
        setError('비밀번호가 올바르지 않습니다');
      } else if (err.code === 'auth/invalid-email') {
        setError('유효하지 않은 이메일입니다');
      } else {
        setError(err.message || '로그인에 실패했습니다');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      // 임시: Google 로그인 구현 예정
      console.log('Google Login 준비 중...');
      setError('Google 로그인은 아직 구현 준비 중입니다');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <main className="pt-[73px]">
        <div className="px-8 py-8">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-neutral-800 to-neutral-600 rounded-lg mx-auto mb-6">
              <i className="fa-solid fa-gem text-white text-lg"></i>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-2xl text-neutral-900 mb-2">로그인</h1>
              <p className="text-neutral-600">Prism Studio 계정으로 로그인하세요</p>
            </div>

            <div className="bg-white border border-neutral-200 rounded-2xl p-8">
              {(error || authError) && (
                <div className={`mb-4 p-3 rounded-lg text-sm ${
                  error.includes('이메일 인증') || authError?.includes('이메일 인증')
                    ? 'bg-amber-50 border border-amber-200 text-amber-700'
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}>
                  {error || authError}
                  {(error.includes('이메일 인증') || authError?.includes('이메일 인증')) && (
                    <p className="mt-2 text-sm">
                      <button
                        onClick={() => navigate('/sign-up')}
                        className="font-semibold underline hover:no-underline"
                      >
                        회원가입 페이지로 이동
                      </button>
                      하여 이메일 인증을 완료해주세요.
                    </p>
                  )}
                </div>
              )}

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm text-neutral-700 mb-2">이메일 주소</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="wedding@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 disabled:bg-neutral-100"
                  />
                </div>

                <div>
                  <label className="block text-sm text-neutral-700 mb-2">비밀번호</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="비밀번호를 입력해주세요"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 disabled:bg-neutral-100"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-neutral-600">로그인 상태 유지</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => navigate('/password-recovery')}
                    className="text-sm text-neutral-900 font-semibold hover:underline"
                  >
                    비밀번호 찾기
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg transition-colors font-medium disabled:bg-neutral-500"
                >
                  {isLoading ? '진행 중...' : '로그인'}
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

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-neutral-300 hover:bg-neutral-50 rounded-lg transition-colors flex items-center justify-center gap-2 text-neutral-900 disabled:bg-neutral-100"
                >
                  <i className="fa-brands fa-google text-lg"></i>
                  Google로 로그인
                </button>

                <button
                  type="button"
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-neutral-300 hover:bg-neutral-50 rounded-lg transition-colors flex items-center justify-center gap-2 text-neutral-900 disabled:bg-neutral-100"
                >
                  <i className="fa-brands fa-naver text-lg"></i>
                  네이버로 로그인
                </button>
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
        </div>
      </main>
    </div>
  );
};
