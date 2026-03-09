import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PrismHeader } from '../components/PrismHeader';
import { PrismFooter } from '../components/PrismFooter';
import { useAuth } from '../contexts/AuthContext';
import { analyticsService } from '../services/AnalyticsService';

export const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const { currentUser, resendEmailVerification, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    // 현재 사용자가 이메일 검증되었는지 확인
    if (currentUser?.emailVerified) {
      analyticsService.trackEmailVerified();
      // 몇 초 후 자동으로 다음 페이지로 이동
      const timer = setTimeout(() => {
        navigate('/order-list');
      }, 2000);
      return () => clearTimeout(timer);
    }

    // 카운트다운 타이머
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, currentUser?.emailVerified, navigate]);

  const handleResendEmail = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      if (!currentUser) {
        setMessage('사용자 정보를 찾을 수 없습니다');
        return;
      }

      await resendEmailVerification(currentUser);
      setMessage('✅ 검증 이메일이 재전송되었습니다. 받은 편지함을 확인해주세요.');
      setCountdown(60);
    } catch (err) {
      setMessage(`❌ 이메일 재전송 실패: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('로그아웃 오류:', err);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <PrismHeader activeNav="verify-email" />
      <main className="flex-1 pt-[73px]">
        <div className="px-8 py-8">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-neutral-800 to-neutral-600 rounded-lg mx-auto mb-6">
              <i className="fa-solid fa-envelope text-white text-lg"></i>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-2xl text-neutral-900 mb-2">이메일 인증</h1>
              <p className="text-neutral-600">등록하신 이메일을 인증해주세요</p>
            </div>

            <div className="bg-white border border-neutral-200 rounded-2xl p-8">
              <div className="mb-6">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900 mb-2">
                    <i className="fa-solid fa-info-circle mr-2"></i>
                    <strong>확인 메일이 발송되었습니다</strong>
                  </p>
                  <p className="text-sm text-blue-800">
                    <strong>{currentUser?.email}</strong>로 보내진 인증 링크를 클릭하여 이메일을 인증해주세요.
                  </p>
                </div>
              </div>

              {message && (
                <div className={`mb-6 p-3 rounded-lg text-sm ${
                  message.includes('✅')
                    ? 'bg-green-50 border border-green-200 text-green-700'
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}>
                  {message}
                </div>
              )}

              <div className="space-y-4">
                <button
                  onClick={handleResendEmail}
                  disabled={isLoading || countdown > 0}
                  className="w-full px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg transition-colors font-medium disabled:bg-neutral-500"
                >
                  {isLoading ? '전송 중...' : countdown > 0 ? `${countdown}초 후 재전송` : '인증 이메일 재전송'}
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-neutral-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-neutral-600">또는</span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full px-6 py-3 border border-neutral-300 hover:bg-neutral-50 text-neutral-900 rounded-lg transition-colors font-medium"
                >
                  로그아웃
                </button>
              </div>

              <div className="mt-6 p-4 bg-neutral-50 rounded-lg">
                <p className="text-sm text-neutral-600 mb-2">
                  <i className="fa-solid fa-lightbulb mr-2"></i>
                  <strong>팁:</strong>
                </p>
                <ul className="text-sm text-neutral-600 space-y-1 list-disc list-inside">
                  <li>스팸 폴더를 확인해주세요</li>
                  <li>이메일 주소가 정확한지 확인해주세요</li>
                  <li>15분 이내에 링크를 클릭해주세요</li>
                </ul>
              </div>

              <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-900">
                  <i className="fa-solid fa-exclamation-triangle mr-2"></i>
                  이메일 인증을 완료하지 않으면 로그인할 수 없습니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <PrismFooter />
    </div>
  );
};
