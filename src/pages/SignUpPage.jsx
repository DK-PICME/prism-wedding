import { useState } from 'react';
import { PrismHeader } from '../components/PrismHeader';
import { PrismFooter } from '../components/PrismFooter';
import { useAuth } from '../contexts/AuthContext';

export const SignUpPage = () => {
  const { signup, loginWithGoogle, error: authError } = useAuth();
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
      window.location.href = '?page=order-list';
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
      // 임시: Google 로그인 구현 예정
      console.log('Google Sign-Up 준비 중...');
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

                <button
                  type="button"
                  onClick={handleGoogleSignUp}
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-neutral-300 hover:bg-neutral-50 rounded-lg transition-colors flex items-center justify-center gap-2 text-neutral-900 disabled:bg-neutral-100"
                >
                  <i className="fa-brands fa-google text-lg"></i>
                  Google로 가입
                </button>

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
                <a href="?page=order-list" className="text-neutral-900 font-semibold hover:underline cursor-pointer">
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
