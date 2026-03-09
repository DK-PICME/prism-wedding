import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PrismHeader } from '../components/PrismHeader';
import { PrismFooter } from '../components/PrismFooter';
import { useAuth } from '../contexts/AuthContext';
import { analyticsService } from '../services/AnalyticsService';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loginWithGooglePopup, error: authError } = useAuth();
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
      analyticsService.trackLogin('email');
      navigate('/order-list');
    } catch (err) {
      const code = err?.code || '';
      if (code === 'auth/invalid-credential' || code === 'auth/user-not-found' || code === 'auth/wrong-password') {
        setError('이메일 또는 비밀번호가 올바르지 않습니다');
      } else if (code === 'auth/invalid-email') {
        setError('유효하지 않은 이메일입니다');
      } else if (code === 'auth/too-many-requests') {
        setError('너무 많은 시도가 있었습니다. 잠시 후 다시 시도해주세요');
      } else if (code === 'auth/user-disabled') {
        setError('비활성화된 계정입니다. 관리자에게 문의해주세요');
      } else if (err?.message?.includes('이메일 미인증') || code === 'auth/email-not-verified') {
        setError('이메일 인증이 필요합니다. 등록된 이메일의 인증 링크를 클릭해주세요.');
      } else {
        setError(err?.message || '로그인에 실패했습니다');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      await loginWithGooglePopup();
      analyticsService.trackLogin('google');
      navigate('/order-list');
    } catch (err) {
      const code = err?.code || '';
      if (code === 'auth/popup-closed-by-user') {
        setError('소셜 로그인이 취소되었습니다');
      } else if (code === 'auth/popup-blocked') {
        setError('팝업이 차단되었습니다. 브라우저 설정에서 팝업을 허용해주세요');
      } else if (code === 'auth/invalid-credential') {
        setError('소셜 로그인에 실패했습니다. 다시 시도해주세요');
      } else {
        setError(err?.message || '소셜 로그인에 실패했습니다');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 flex flex-col">
      <PrismHeader activeNav="login" />
      <main className="flex-1 pt-[73px]">
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

                <div className="w-full">
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    className="w-full px-4 py-3 border border-neutral-300 hover:bg-neutral-50 rounded-lg transition-colors flex items-center justify-center gap-3 text-neutral-900 font-medium disabled:bg-neutral-100 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Google로 로그인
                  </button>
                </div>

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
      <PrismFooter />
    </div>
  );
};
