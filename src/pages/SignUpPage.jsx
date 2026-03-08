import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PrismHeader } from '../components/PrismHeader';
import { PrismFooter } from '../components/PrismFooter';
import { useAuth } from '../contexts/AuthContext';

export const SignUpPage = () => {
  const navigate = useNavigate();
  const { signup, loginWithGooglePopup, error: authError } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    studioName: '',
    email: '',
    password: '',
    passwordConfirm: '',
  });
  const [agreeTerms, setAgreeTerms] = useState({
    terms: false,
    privacy: false,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (name) => {
    setAgreeTerms(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const validateForm = () => {
    if (!formData.studioName.trim()) {
      setError('스튜디오명을 입력해주세요');
      return false;
    }

    if (!formData.email.trim()) {
      setError('이메일을 입력해주세요');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('유효한 이메일 주소를 입력해주세요');
      return false;
    }

    if (formData.password.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다');
      return false;
    }

    if (!/[0-9]/.test(formData.password)) {
      setError('비밀번호에 숫자를 포함해주세요');
      return false;
    }

    if (!/[!@#$%^&*]/.test(formData.password)) {
      setError('비밀번호에 특수문자를 포함해주세요');
      return false;
    }

    if (formData.password !== formData.passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다');
      return false;
    }

    if (!agreeTerms.terms || !agreeTerms.privacy) {
      setError('이용약관과 개인정보처리방침에 동의해주세요');
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
      await signup(formData.email, formData.password, formData.studioName);
      navigate('/verify-email');
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('이미 사용 중인 이메일입니다');
      } else if (err.code === 'auth/weak-password') {
        setError('비밀번호가 너무 약합니다');
      } else {
        setError(err.message || '회원가입에 실패했습니다');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError('');
    setIsLoading(true);
    try {
      await loginWithGooglePopup();
      navigate('/order-list');
    } catch (err) {
      setError(err.message || 'Google 로그인에 실패했습니다');
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
              <h1 className="text-2xl text-neutral-900 mb-2">회원가입</h1>
              <p className="text-neutral-600">Prism Studio에 가입하여 사진 보정 서비스를 시작하세요</p>
            </div>

            <div className="bg-white border border-neutral-200 rounded-2xl p-8">
              {(error || authError) && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {error || authError}
                </div>
              )}

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm text-neutral-700 mb-2">스튜디오명</label>
                  <input
                    type="text"
                    name="studioName"
                    placeholder="예: 웨딩 스튜디오"
                    value={formData.studioName}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 disabled:bg-neutral-100"
                  />
                </div>

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
                    placeholder="8자 이상, 숫자, 특수문자 포함"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 disabled:bg-neutral-100"
                  />
                </div>

                <div>
                  <label className="block text-sm text-neutral-700 mb-2">비밀번호 확인</label>
                  <input
                    type="password"
                    name="passwordConfirm"
                    placeholder="비밀번호를 다시 입력해주세요"
                    value={formData.passwordConfirm}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 disabled:bg-neutral-100"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-start gap-2 p-3 border border-neutral-300 rounded-lg cursor-pointer hover:bg-neutral-50">
                    <input
                      type="checkbox"
                      checked={agreeTerms.terms}
                      onChange={() => handleCheckboxChange('terms')}
                      disabled={isLoading}
                      className="w-4 h-4 mt-0.5"
                    />
                    <span className="text-sm text-neutral-600">
                      <a href="#" className="text-neutral-900 font-semibold hover:underline">이용약관</a>에 동의합니다
                    </span>
                  </label>

                  <label className="flex items-start gap-2 p-3 border border-neutral-300 rounded-lg cursor-pointer hover:bg-neutral-50">
                    <input
                      type="checkbox"
                      checked={agreeTerms.privacy}
                      onChange={() => handleCheckboxChange('privacy')}
                      disabled={isLoading}
                      className="w-4 h-4 mt-0.5"
                    />
                    <span className="text-sm text-neutral-600">
                      <a href="#" className="text-neutral-900 font-semibold hover:underline">개인정보처리방침</a>에 동의합니다
                    </span>
                  </label>

                  <label className="flex items-start gap-2 p-3 border border-neutral-300 rounded-lg cursor-pointer hover:bg-neutral-50">
                    <input type="checkbox" className="w-4 h-4 mt-0.5" disabled={isLoading} />
                    <span className="text-sm text-neutral-600">마케팅 정보 수신에 동의합니다 (선택)</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg transition-colors font-medium disabled:bg-neutral-500"
                >
                  {isLoading ? '진행 중...' : '회원가입'}
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
                    onClick={handleGoogleSignUp}
                    disabled={isLoading}
                    className="w-full px-4 py-3 border border-neutral-300 hover:bg-neutral-50 rounded-lg transition-colors flex items-center justify-center gap-3 text-neutral-900 font-medium disabled:bg-neutral-100 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Google로 가입
                  </button>
                </div>

                <button
                  type="button"
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-neutral-300 hover:bg-neutral-50 rounded-lg transition-colors flex items-center justify-center gap-2 text-neutral-900 disabled:bg-neutral-100"
                >
                  <i className="fa-brands fa-naver text-lg"></i>
                  네이버로 가입
                </button>
              </div>
            </div>

            <div className="text-center mt-6">
              <p className="text-sm text-neutral-600">
                이미 계정이 있으신가요?{' '}
                <button
                  onClick={() => navigate('/login')}
                  className="text-neutral-900 font-semibold hover:underline cursor-pointer"
                >
                  로그인
                </button>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
