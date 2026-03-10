import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const PrismHeader = ({ activeNav = 'order-list' }) => {
  const navigate = useNavigate();
  const { currentUser, userData, logout } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
  
  const navItems = [
    { id: 'photo-management', label: '사진 관리', icon: 'fa-images', path: '/photo-management' },
    { id: 'order-list', label: '주문 내역', icon: 'fa-list-check', path: '/order-list' },
  ];

  // 사용자 정보 우선순위: userData.displayName > currentUser.displayName > 이메일앞부분
  const displayName = userData?.displayName || currentUser?.displayName || currentUser?.email?.split('@')[0] || '사용자';
  const userEmail = userData?.email || currentUser?.email || 'user@example.com';
  const photoURL = userData?.photoURL || currentUser?.photoURL || null;

  // 프로필 메뉴 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };

    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isProfileMenuOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  const handleMenuItemClick = (path) => {
    setIsProfileMenuOpen(false);
    navigate(path);
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 z-50">
      <div className="flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-neutral-800 to-neutral-600 rounded-lg">
              <i className="fa-solid fa-gem text-white text-lg"></i>
            </div>
            <span className="text-xl text-neutral-900 dark:text-white">Prism Studio</span>
          </div>

          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeNav === item.id
                    ? 'text-neutral-900 bg-neutral-100'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                }`}
              >
                <i className={`fa-solid ${item.icon} mr-2`}></i>
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/notification-center')}
            className="relative p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-lg transition-colors"
          >
            <i className="fa-solid fa-bell text-xl"></i>
            <span className="absolute top-1 right-1 w-2 h-2 bg-neutral-500 rounded-full"></span>
          </button>

          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-3 pl-4 border-l border-neutral-200 hover:bg-neutral-50 px-3 py-1 rounded-lg transition-colors"
            >
              {photoURL ? (
                <img
                  src={photoURL}
                  alt="User"
                  className="w-10 h-10 rounded-full border-2 border-neutral-200 object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full border-2 border-neutral-200 bg-gradient-to-r from-neutral-800 to-neutral-600 flex items-center justify-center">
                  <i className="fa-solid fa-user text-white text-sm"></i>
                </div>
              )}
              <div className="text-sm text-left">
                <div className="text-neutral-900">{displayName}</div>
                <div className="text-neutral-500 text-xs">{userEmail}</div>
              </div>
              <i className={`fa-solid fa-chevron-down text-xs text-neutral-600 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`}></i>
            </button>

            {/* 드롭다운 메뉴 */}
            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-neutral-200 rounded-lg shadow-lg z-50">
                <div className="p-3 border-b border-neutral-200">
                  <div className="text-sm text-neutral-900 font-medium">{displayName}</div>
                  <div className="text-xs text-neutral-500">{userEmail}</div>
                </div>

                <div className="py-2">
                  <button
                    onClick={() => handleMenuItemClick('/settings')}
                    className="w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-3 transition-colors"
                  >
                    <i className="fa-solid fa-gear text-neutral-600"></i>
                    설정
                  </button>

                  <button
                    onClick={() => handleMenuItemClick('/inquiry')}
                    className="w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-3 transition-colors"
                  >
                    <i className="fa-solid fa-question-circle text-neutral-600"></i>
                    도움말
                  </button>

                  <div className="border-t border-neutral-200 my-2"></div>

                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-sm text-neutral-900 hover:bg-neutral-100 flex items-center gap-3 transition-colors"
                  >
                    <i className="fa-solid fa-sign-out-alt text-neutral-900"></i>
                    로그아웃
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
