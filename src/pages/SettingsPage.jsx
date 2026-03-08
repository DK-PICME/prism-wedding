import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { PrismHeader } from '../components/PrismHeader';
import { PrismFooter } from '../components/PrismFooter';

export const SettingsPage = () => {
  const navigate = useNavigate();
  const { currentUser, userData, logout, updateUserProfile, deleteAccount } = useAuth();
  
  // State management
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [displayNameInput, setDisplayNameInput] = useState(userData?.displayName || currentUser?.displayName || currentUser?.email?.split('@')[0] || '');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  
  // 사용자 이름 (displayName 또는 이메일의 앞 부분)
  const displayName = userData?.displayName || currentUser?.displayName || currentUser?.email?.split('@')[0] || '사용자';
  const userEmail = currentUser?.email || 'user@example.com';

  const handleSaveProfile = async () => {
    if (!displayNameInput.trim()) {
      setProfileError('이름을 입력해주세요');
      return;
    }

    setIsSavingProfile(true);
    setProfileError('');
    setProfileSuccess('');

    try {
      await updateUserProfile(displayNameInput);
      setProfileSuccess('프로필이 성공적으로 저장되었습니다');
      setTimeout(() => setProfileSuccess(''), 3000);
    } catch (err) {
      setProfileError(err.message || '프로필 저장에 실패했습니다');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deleteConfirmation) {
      setDeleteError('계정 삭제를 확인해주세요');
      return;
    }

    // Google 로그인 사용자는 비밀번호 불필요, 이메일/비밀번호 사용자는 비밀번호 필요
    const isEmailPasswordUser = currentUser?.providerData.some(provider => provider.providerId === 'password');
    if (isEmailPasswordUser && !deletePassword.trim()) {
      setDeleteError('비밀번호를 입력해주세요');
      return;
    }

    setIsDeletingAccount(true);
    setDeleteError('');

    try {
      await deleteAccount(deletePassword);
      navigate('/login');
    } catch (err) {
      setDeleteError(err.message || '계정 삭제에 실패했습니다');
      setIsDeletingAccount(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setLogoutError('');
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      setLogoutError(err.message || '로그아웃에 실패했습니다');
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <PrismHeader activeNav="settings" />

      <main className="pt-[73px]">
        <div className="px-8 py-8">
          <div className="max-w-[1376px] mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl text-neutral-900 mb-2">설정</h1>
              <p className="text-neutral-600">계정, 알림, 다운로드 설정 등을 관리하세요</p>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-1">
                <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                  <div className="text-center mb-6">
                    <img
                      src="https://api.dicebear.com/7.x/notionists/svg?scale=200&seed=4782"
                      alt="User"
                      className="w-24 h-24 rounded-full border-4 border-neutral-200 mx-auto mb-4"
                    />
                    <h3 className="text-xl text-neutral-900 mb-1">{displayName}</h3>
                    <p className="text-neutral-600 text-sm">{userEmail}</p>
                    <button className="mt-3 px-4 py-2 border border-neutral-300 hover:bg-neutral-50 rounded-lg text-sm transition-colors">
                      <i className="fa-solid fa-camera mr-2"></i>아바타 변경
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-neutral-700 mb-2">이름</label>
                      <input 
                        type="text" 
                        value={displayNameInput}
                        onChange={(e) => setDisplayNameInput(e.target.value)}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-neutral-700 mb-2">이메일</label>
                      <input 
                        type="email" 
                        value={userEmail} 
                        disabled
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-neutral-50 text-neutral-600 focus:outline-none" 
                      />
                      <p className="text-xs text-neutral-600 mt-1">이메일 변경은 지원하지 않습니다</p>
                    </div>
                    {profileError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                        {profileError}
                      </div>
                    )}
                    {profileSuccess && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                        {profileSuccess}
                      </div>
                    )}
                    <button 
                      onClick={handleSaveProfile}
                      disabled={isSavingProfile}
                      className="w-full px-4 py-2 bg-neutral-900 text-white hover:bg-neutral-800 rounded-lg transition-colors disabled:bg-neutral-400 font-medium"
                    >
                      {isSavingProfile ? '저장 중...' : '프로필 저장'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="col-span-2 space-y-6">
                <div className="bg-white border border-neutral-200 rounded-2xl">
                  <div className="border-b border-neutral-200 p-6">
                    <h2 className="text-xl text-neutral-900">로그인 및 보안</h2>
                  </div>
                  <div className="p-6 space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg text-neutral-900">연결된 계정</h3>
                          <p className="text-sm text-neutral-600">소셜 로그인 계정을 관리하세요</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-neutral-600 rounded-lg flex items-center justify-center">
                              <span className="text-white text-xs">N</span>
                            </div>
                            <div>
                              <div className="text-neutral-900">네이버</div>
                              <div className="text-sm text-neutral-600">naver_user@naver.com</div>
                            </div>
                          </div>
                          <button className="px-3 py-1 text-sm border border-neutral-300 hover:bg-neutral-50 rounded">연결 해제</button>
                        </div>

                        <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-neutral-400 rounded-lg flex items-center justify-center">
                              <i className="fa-solid fa-envelope text-white text-xs"></i>
                            </div>
                            <div>
                              <div className="text-neutral-900">이메일</div>
                              <div className="text-sm text-neutral-600">{userEmail}</div>
                            </div>
                          </div>
                          <span className="px-3 py-1 text-sm bg-neutral-100 text-neutral-600 rounded">기본 계정</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg text-neutral-900 mb-3">비밀번호 변경</h3>
                      <div className="space-y-3">
                        <input type="password" placeholder="현재 비밀번호" className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500" />
                        <input type="password" placeholder="새 비밀번호" className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500" />
                        <input type="password" placeholder="새 비밀번호 확인" className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500" />
                        <button className="px-4 py-2 bg-neutral-900 text-white hover:bg-neutral-800 rounded-lg transition-colors">
                          비밀번호 변경
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-neutral-200 pt-6">
                      <h3 className="text-lg text-neutral-900 mb-3">계정 관리</h3>
                      <div className="space-y-3">
                        {logoutError && (
                          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                            {logoutError}
                          </div>
                        )}
                        <button
                          onClick={handleLogout}
                          disabled={isLoggingOut}
                          className="w-full px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg transition-colors disabled:bg-neutral-400 font-medium"
                        >
                          {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-neutral-200 pt-6">
                      <h3 className="text-lg text-neutral-900 mb-3">계정 삭제</h3>
                      <p className="text-sm text-neutral-600 mb-4">
                        계정을 삭제하면 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.
                      </p>
                      
                      {!deleteConfirmation ? (
                        <button
                          onClick={() => setDeleteConfirmation(true)}
                          className="w-full px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors font-medium"
                        >
                          계정 삭제하기
                        </button>
                      ) : (
                        <div className="space-y-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-700 font-medium">
                            정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                          </p>
                          {currentUser?.providerData.some(provider => provider.providerId === 'password') && (
                            <input
                              type="password"
                              placeholder="비밀번호 입력"
                              value={deletePassword}
                              onChange={(e) => setDeletePassword(e.target.value)}
                              className="w-full px-3 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                              disabled={isDeletingAccount}
                            />
                          )}
                          {deleteError && (
                            <div className="p-2 bg-red-100 border border-red-300 rounded text-sm text-red-700">
                              {deleteError}
                            </div>
                          )}
                          <div className="flex gap-3">
                            <button
                              onClick={() => {
                                setDeleteConfirmation(false);
                                setDeleteError('');
                                setDeletePassword('');
                              }}
                              disabled={isDeletingAccount}
                              className="flex-1 px-4 py-2 bg-neutral-200 text-neutral-900 hover:bg-neutral-300 rounded-lg transition-colors disabled:bg-neutral-100"
                            >
                              취소
                            </button>
                            <button
                              onClick={handleDeleteAccount}
                              disabled={isDeletingAccount}
                              className="flex-1 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors disabled:bg-red-400 font-medium"
                            >
                              {isDeletingAccount ? '삭제 중...' : '계정 삭제'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-neutral-200 rounded-2xl">
                  <div className="border-b border-neutral-200 p-6">
                    <h2 className="text-xl text-neutral-900">알림 설정</h2>
                  </div>
                  <div className="p-6 space-y-4">
                    {[
                      { title: '업로드 완료 알림', desc: '사진 업로드가 완료되면 알림을 받습니다', checked: true },
                      { title: '주문 상태 변경 알림', desc: '주문 진행 상태가 변경되면 알림을 받습니다', checked: true },
                      { title: '다운로드 준비 알림', desc: '보정된 사진 다운로드가 준비되면 알림을 받습니다', checked: true },
                      { title: '마케팅 알림', desc: '새로운 기능 및 프로모션 정보를 받습니다', checked: false },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div>
                          <div className="text-neutral-900">{item.title}</div>
                          <div className="text-sm text-neutral-600">{item.desc}</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked={item.checked} />
                          <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neutral-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-neutral-200 rounded-2xl">
                  <div className="border-b border-neutral-200 p-6">
                    <h2 className="text-xl text-neutral-900">다운로드 설정</h2>
                  </div>
                  <div className="p-6 space-y-6">
                    <div>
                      <label className="block text-sm text-neutral-700 mb-2">기본 다운로드 폴더</label>
                      <div className="flex gap-2">
                        <input type="text" defaultValue="/Users/studio/Downloads/PrismStudio" className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500" />
                        <button className="px-4 py-2 border border-neutral-300 hover:bg-neutral-50 rounded-lg transition-colors">
                          <i className="fa-solid fa-folder-open"></i>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-neutral-700 mb-2">파일명 규칙</label>
                      <select className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500">
                        <option>주문번호_원본파일명</option>
                        <option>날짜_주문번호_파일명</option>
                        <option>원본파일명_보정완료</option>
                        <option>사용자정의</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-neutral-700 mb-2">압축 형식</label>
                      <div className="flex gap-4">
                        {['ZIP', 'RAR', '압축 안함'].map((format, idx) => (
                          <label key={idx} className="flex items-center gap-2">
                            <input type="radio" name="compression" defaultChecked={idx === 0} className="w-4 h-4" />
                            <span className="text-neutral-900">{format}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-neutral-200 rounded-2xl">
                  <div className="border-b border-neutral-200 p-6">
                    <h2 className="text-xl text-neutral-900">언어 및 테마</h2>
                  </div>
                  <div className="p-6 space-y-6">
                    <div>
                      <label className="block text-sm text-neutral-700 mb-2">언어</label>
                      <select className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500">
                        <option>한국어</option>
                        <option>English</option>
                        <option>日本語</option>
                        <option>中文</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-neutral-700 mb-2">테마</label>
                      <div className="grid grid-cols-3 gap-3">
                        {['라이트', '다크', '자동'].map((theme, idx) => (
                          <label key={idx} className="flex items-center gap-2 p-3 border border-neutral-300 rounded-lg cursor-pointer hover:bg-neutral-50">
                            <input type="radio" name="theme" defaultChecked={idx === 0} className="w-4 h-4" />
                            <span className="text-neutral-900">{theme}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <PrismFooter />
    </div>
  );
};
