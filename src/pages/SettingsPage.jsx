import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { PrismHeader } from '../components/PrismHeader';
import { PrismFooter } from '../components/PrismFooter';
import { ChangePasswordModal } from '../components/ChangePasswordModal';
import { compressImage, formatFileSize } from '../utils/imageCompression';
import { getProfileImageUrl } from '../utils/avatarUtils';

export const SettingsPage = () => {
  const navigate = useNavigate();
  const { currentUser, userData, logout, updateUserProfile, updateUserSettings, unlinkProvider, deleteAccount, changePassword } = useAuth();
  
  // State management
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [unlinkTargetProviderId, setUnlinkTargetProviderId] = useState(null);
  const [unlinkPassword, setUnlinkPassword] = useState('');
  const [unlinkError, setUnlinkError] = useState('');
  const [isUnlinking, setIsUnlinking] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [displayNameInput, setDisplayNameInput] = useState(userData?.displayName || currentUser?.displayName || currentUser?.email?.split('@')[0] || '');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  
  // 아바타 변경
  const [avatarPreview, setAvatarPreview] = useState(userData?.photoURL || null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const fileInputRef = useRef(null);
  
  // 비밀번호 변경 모달
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // 다운로드 설정
  const [fileNameRule, setFileNameRule] = useState(userData?.settings?.download?.fileNameRule || '주문번호_원본파일명');
  const [customFileNameRule, setCustomFileNameRule] = useState(userData?.settings?.download?.customFileNameRule || '');
  const [compressionFormat, setCompressionFormat] = useState(userData?.settings?.download?.compressionFormat || 'ZIP');

  // 테마 설정
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  
  // 사용자 이름 (displayName 또는 이메일의 앞 부분)
  const displayName = userData?.displayName || currentUser?.displayName || currentUser?.email?.split('@')[0] || '사용자';
  const userEmail = currentUser?.email || 'user@example.com';

  // providerId → 표시명·아이콘 매핑
  const providerConfig = {
    password: { label: '이메일', icon: 'fa-solid fa-envelope', bgClass: 'bg-neutral-400' },
    'google.com': { label: 'Google', icon: null, bgClass: 'bg-white border border-neutral-200' },
    'facebook.com': { label: 'Facebook', icon: 'fa-brands fa-facebook-f', bgClass: 'bg-[#1877f2]' },
    'twitter.com': { label: 'X', icon: 'fa-brands fa-x-twitter', bgClass: 'bg-neutral-900' },
    'github.com': { label: 'GitHub', icon: 'fa-brands fa-github', bgClass: 'bg-neutral-800' },
  };
  const getProviderInfo = (providerId) => providerConfig[providerId] || { label: providerId, icon: 'fa-solid fa-link', bgClass: 'bg-neutral-500' };

  // 아바타 변경 핸들러
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 검증
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (file.size > maxSize) {
      setAvatarError('파일 크기는 5MB 이하여야 합니다');
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      setAvatarError('JPG, PNG, WebP 형식만 지원합니다');
      return;
    }

    setAvatarError('');
    setIsUploadingAvatar(true);

    try {
      // 로컬 미리보기
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result);
      };
      reader.readAsDataURL(file);

      // 이미지 압축 (프로필용 200x200, 80% 품질)
      const compressedFile = await compressImage(file, {
        maxWidth: 200,
        maxHeight: 200,
        quality: 0.8,
        format: 'image/jpeg',
      });

      console.log(`원본: ${formatFileSize(file.size)} → 압축: ${formatFileSize(compressedFile.size)}`);

      // Firebase Storage에 업로드
      const firebaseApp = (await import('../config/firebase')).default;
      const firebaseStorage = getStorage(firebaseApp);
      const fileName = `users/${currentUser.uid}/avatar_${Date.now()}`;
      const fileRef = ref(firebaseStorage, fileName);
      
      await uploadBytes(fileRef, compressedFile);
      const photoURL = await getDownloadURL(fileRef);

      // Firestore에 photoURL 저장
      await updateUserProfile(displayNameInput, photoURL);
      
      // 로컬 상태 업데이트
      setAvatarPreview(photoURL);
    } catch (err) {
      console.error('아바타 업로드 실패:', err);
      setAvatarError('아바타 업로드에 실패했습니다');
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

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

  const handleUnlinkClick = (providerId) => {
    setUnlinkTargetProviderId(providerId);
    setUnlinkPassword('');
    setUnlinkError('');
  };

  const handleUnlinkConfirm = async () => {
    if (!unlinkTargetProviderId) return;
    const needsPassword = unlinkTargetProviderId === 'google.com' &&
      currentUser?.providerData?.some((p) => p.providerId === 'password');
    if (needsPassword && !unlinkPassword.trim()) {
      setUnlinkError('재인증을 위해 비밀번호를 입력해주세요');
      return;
    }

    setIsUnlinking(true);
    setUnlinkError('');
    try {
      await unlinkProvider(unlinkTargetProviderId, { password: unlinkPassword });
      setUnlinkTargetProviderId(null);
      setUnlinkPassword('');
    } catch (err) {
      setUnlinkError(err.message || '연결 해제에 실패했습니다');
    } finally {
      setIsUnlinking(false);
    }
  };

  const handleUnlinkCancel = () => {
    setUnlinkTargetProviderId(null);
    setUnlinkPassword('');
    setUnlinkError('');
  };

  // 비밀번호 변경 핸들러
  const handleChangePassword = async (currentPassword, newPassword, newPasswordConfirm) => {
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword.trim()) {
      setPasswordError('현재 비밀번호를 입력해주세요');
      return;
    }
    if (!newPassword.trim()) {
      setPasswordError('새 비밀번호를 입력해주세요');
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      setPasswordError('새 비밀번호가 일치하지 않습니다');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('새 비밀번호는 최소 6자 이상이어야 합니다');
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordSuccess('비밀번호가 성공적으로 변경되었습니다');
      setTimeout(() => {
        setPasswordSuccess('');
        setIsPasswordModalOpen(false);
      }, 2000);
    } catch (err) {
      setPasswordError(err.message || '비밀번호 변경에 실패했습니다');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // 파일명 규칙 저장
  const handleSaveFileNameRule = async () => {
    try {
      const downloadSettings = { ...userData?.settings?.download };
      
      if (fileNameRule === '사용자정의') {
        if (!customFileNameRule.trim()) {
          alert('사용자정의 파일명 규칙을 입력해주세요');
          return;
        }
        downloadSettings.fileNameRule = '사용자정의';
        downloadSettings.customFileNameRule = customFileNameRule;
      } else {
        downloadSettings.fileNameRule = fileNameRule;
        downloadSettings.customFileNameRule = '';
      }
      
      await updateUserSettings({
        download: downloadSettings,
      });
    } catch (err) {
      console.error('파일명 규칙 저장 실패:', err);
    }
  };

  // 압축 형식 저장
  const handleSaveCompressionFormat = async () => {
    try {
      await updateUserSettings({
        download: { ...userData?.settings?.download, compressionFormat },
      });
    } catch (err) {
      console.error('압축 형식 저장 실패:', err);
    }
  };

  // 테마 변경
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    // DOM에 테마 적용
    const html = document.documentElement;
    if (newTheme === 'dark') {
      html.classList.add('dark');
    } else if (newTheme === 'light') {
      html.classList.remove('dark');
    } else {
      // auto 모드: 시스템 설정 따르기
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        html.classList.add('dark');
      } else {
        html.classList.remove('dark');
      }
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <PrismHeader activeNav="settings" />

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        isLoading={isChangingPassword}
        error={passwordError}
        success={passwordSuccess}
        onClose={() => setIsPasswordModalOpen(false)}
        onSubmit={handleChangePassword}
      />

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
                    <div className="relative inline-block">
                      <img
                        src={getProfileImageUrl(avatarPreview || userData?.photoURL, currentUser?.uid, 200)}
                        alt="User"
                        className="w-24 h-24 rounded-full border-4 border-neutral-200 mx-auto mb-4 object-cover"
                      />
                      {isUploadingAvatar && (
                        <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                          <div className="text-white text-xs">업로드 중...</div>
                        </div>
                      )}
                    </div>
                    <h3 className="text-xl text-neutral-900 mb-1">{displayName}</h3>
                    <p className="text-neutral-600 text-sm">{userEmail}</p>
                    <div className="mt-3 flex gap-2 justify-center">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleAvatarChange}
                        disabled={isUploadingAvatar}
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingAvatar}
                        className="px-4 py-2 border border-neutral-300 text-neutral-700 hover:bg-neutral-50 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <i className="fa-solid fa-camera mr-2"></i>
                        {isUploadingAvatar ? '업로드 중...' : '아바타 변경'}
                      </button>
                    </div>
                    {avatarError && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                        {avatarError}
                      </div>
                    )}
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
                    <h2 className="text-xl text-neutral-900">알림 설정</h2>
                  </div>
                  <div className="p-6 space-y-4">
                    {[
                      { key: 'uploadComplete', title: '업로드 완료 알림', desc: '사진 업로드가 완료되면 알림을 받습니다', default: true },
                      { key: 'orderStatusChange', title: '주문 상태 변경 알림', desc: '주문 진행 상태가 변경되면 알림을 받습니다', default: true },
                      { key: 'downloadReady', title: '다운로드 준비 알림', desc: '보정된 사진 다운로드가 준비되면 알림을 받습니다', default: true },
                      { key: 'marketing', title: '마케팅 알림', desc: '새로운 기능 및 프로모션 정보를 받습니다', default: false },
                    ].map((item) => {
                      const checked = userData?.settings?.notifications?.[item.key] ?? item.default;
                      return (
                        <div key={item.key} className="flex items-center justify-between">
                          <div>
                            <div className="text-neutral-900">{item.title}</div>
                            <div className="text-sm text-neutral-600">{item.desc}</div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={checked}
                              onChange={async (e) => {
                                try {
                                  await updateUserSettings({
                                    notifications: { [item.key]: e.target.checked },
                                  });
                                } catch (err) {
                                  console.error('알림 설정 저장 실패:', err);
                                }
                              }}
                            />
                            <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neutral-600"></div>
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white border border-neutral-200 rounded-2xl">
                  <div className="border-b border-neutral-200 p-6">
                    <h2 className="text-xl text-neutral-900">다운로드 설정</h2>
                  </div>
                  <div className="p-6 space-y-6">
                    <div>
                      <label className="block text-sm text-neutral-700 mb-2">파일명 규칙</label>
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <select 
                            value={fileNameRule}
                            onChange={(e) => setFileNameRule(e.target.value)}
                            className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500"
                          >
                            <option value="주문번호_원본파일명">주문번호_원본파일명</option>
                            <option value="날짜_주문번호_파일명">날짜_주문번호_파일명</option>
                            <option value="원본파일명_보정완료">원본파일명_보정완료</option>
                            <option value="사용자정의">사용자정의</option>
                          </select>
                          <button
                            onClick={handleSaveFileNameRule}
                            className="px-4 py-2 bg-neutral-900 text-white hover:bg-neutral-800 rounded-lg transition-colors"
                          >
                            저장
                          </button>
                        </div>
                        
                        {/* 사용자정의 옵션 표시 */}
                        {fileNameRule === '사용자정의' && (
                          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-neutral-700 mb-2">사용자정의 파일명 규칙</label>
                              <input
                                type="text"
                                placeholder="예: {주문번호}_{날짜}_{파일명}"
                                value={customFileNameRule}
                                onChange={(e) => setCustomFileNameRule(e.target.value)}
                                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div className="text-sm text-neutral-600">
                              <p className="font-medium mb-2">사용 가능한 변수:</p>
                              <ul className="space-y-1 list-disc list-inside">
                                <li><code className="bg-neutral-100 px-2 py-1 rounded">{'{주문번호}'}</code> - 주문 번호</li>
                                <li><code className="bg-neutral-100 px-2 py-1 rounded">{'{날짜}'}</code> - 저장 날짜 (YYYYMMDD)</li>
                                <li><code className="bg-neutral-100 px-2 py-1 rounded">{'{시간}'}</code> - 저장 시간 (HHMMSS)</li>
                                <li><code className="bg-neutral-100 px-2 py-1 rounded">{'{파일명}'}</code> - 원본 파일명</li>
                              </ul>
                            </div>
                            <div className="text-sm text-neutral-600 bg-white p-2 rounded border border-neutral-200">
                              <p className="font-medium mb-1">미리보기:</p>
                              <p className="text-blue-600">
                                {customFileNameRule
                                  .replace('{주문번호}', '20260309001')
                                  .replace('{날짜}', '20260309')
                                  .replace('{시간}', '143025')
                                  .replace('{파일명}', 'photo.jpg')
                                  || '규칙을 입력하면 미리보기가 표시됩니다'}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-neutral-700 mb-2">압축 형식</label>
                      <div className="space-y-3">
                        <div className="flex gap-4">
                          {['ZIP', 'RAR', '압축 안함'].map((format) => (
                            <label key={format} className="flex items-center gap-2">
                              <input 
                                type="radio" 
                                name="compression" 
                                value={format}
                                checked={compressionFormat === format}
                                onChange={(e) => setCompressionFormat(e.target.value)}
                                className="w-4 h-4" 
                              />
                              <span className="text-neutral-900">{format}</span>
                            </label>
                          ))}
                        </div>
                        <button
                          onClick={handleSaveCompressionFormat}
                          className="px-4 py-2 bg-neutral-900 text-white hover:bg-neutral-800 rounded-lg transition-colors"
                        >
                          저장
                        </button>
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
                      <label className="block text-sm text-neutral-700 mb-2">테마</label>
                      <div className="grid grid-cols-3 gap-3">
                        {[{ value: 'light', label: '라이트' }, { value: 'dark', label: '다크' }, { value: 'auto', label: '자동' }].map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => handleThemeChange(opt.value)}
                            className={`p-3 border rounded-lg transition-colors ${
                              theme === opt.value
                                ? 'border-neutral-900 bg-neutral-100'
                                : 'border-neutral-300 hover:bg-neutral-50'
                            }`}
                          >
                            <div className="text-neutral-900 text-sm font-medium">{opt.label}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

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
                        {currentUser?.providerData?.length ? (
                          currentUser.providerData.map((provider, idx) => {
                            const info = getProviderInfo(provider.providerId);
                            const email = provider.email || userEmail;
                            const isPrimary = idx === 0;
                            const canUnlink = currentUser.providerData.length > 1;
                            const isUnlinkTarget = unlinkTargetProviderId === provider.providerId;
                            const needsPasswordForUnlink = provider.providerId === 'google.com' &&
                              currentUser?.providerData?.some((p) => p.providerId === 'password');

                            return (
                              <div key={provider.providerId + (provider.uid || idx)} className="border border-neutral-200 rounded-lg overflow-hidden">
                                <div className="flex items-center justify-between p-4">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${info.bgClass}`}>
                                      {provider.providerId === 'google.com' ? (
                                        <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                                      ) : info.icon ? (
                                        <i className={`${info.icon} text-white text-xs`}></i>
                                      ) : null}
                                    </div>
                                    <div>
                                      <div className="text-neutral-900">{info.label}</div>
                                      <div className="text-sm text-neutral-600">{email}</div>
                                    </div>
                                  </div>
                                  {canUnlink ? (
                                    <button
                                      onClick={() => handleUnlinkClick(provider.providerId)}
                                      disabled={isUnlinking}
                                      className="px-3 py-1 text-sm border border-neutral-300 hover:bg-neutral-50 rounded text-neutral-700 disabled:opacity-50"
                                    >
                                      연결 해제
                                    </button>
                                  ) : (
                                    <span className="px-3 py-1 text-sm bg-neutral-100 text-neutral-600 rounded">기본 계정</span>
                                  )}
                                </div>

                                {isUnlinkTarget && (
                                  <div className="px-4 pb-4 pt-0 border-t border-neutral-100">
                                    {needsPasswordForUnlink ? (
                                      <div className="space-y-3 mt-3">
                                        <p className="text-sm text-neutral-600">이메일 계정으로 재인증하기 위해 비밀번호를 입력해주세요</p>
                                        <input
                                          type="password"
                                          placeholder="비밀번호"
                                          value={unlinkPassword}
                                          onChange={(e) => setUnlinkPassword(e.target.value)}
                                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500"
                                          disabled={isUnlinking}
                                        />
                                      </div>
                                    ) : (
                                      <p className="text-sm text-neutral-600 mt-3">연결된 소셜 계정으로 재인증한 후 이메일 연결이 해제됩니다.</p>
                                    )}
                                    {unlinkError && (
                                      <p className="text-sm text-red-600 mt-2">{unlinkError}</p>
                                    )}
                                    <div className="flex gap-2 mt-3">
                                      <button
                                        onClick={handleUnlinkCancel}
                                        disabled={isUnlinking}
                                        className="px-3 py-1.5 text-sm border border-neutral-300 hover:bg-neutral-50 rounded"
                                      >
                                        취소
                                      </button>
                                      <button
                                        onClick={handleUnlinkConfirm}
                                        disabled={isUnlinking}
                                        className="px-3 py-1.5 text-sm bg-neutral-900 text-white hover:bg-neutral-800 rounded disabled:opacity-50"
                                      >
                                        {isUnlinking ? '처리 중...' : '확인'}
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })
                        ) : (
                          <div className="p-4 border border-neutral-200 rounded-lg text-sm text-neutral-500">
                            연결된 계정 정보를 불러올 수 없습니다.
                          </div>
                        )}
                      </div>
                    </div>

                    {currentUser?.providerData?.some(provider => provider.providerId === 'password') && (
                      <div>
                        <div className="border-t border-neutral-200 my-2"></div>
                      </div>
                    )}

                    <div className="border-t border-neutral-200 pt-6">
                      <h3 className="text-lg text-neutral-900 mb-3">계정 관리</h3>
                      <div className="space-y-3">
                        {logoutError && (
                          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                            {logoutError}
                          </div>
                        )}
                        {currentUser?.providerData?.some(provider => provider.providerId === 'password') && (
                          <button
                            onClick={() => setIsPasswordModalOpen(true)}
                            className="w-full px-4 py-2 border border-neutral-300 text-neutral-700 hover:bg-neutral-50 rounded-lg transition-colors font-medium"
                          >
                            비밀번호 변경
                          </button>
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
              </div>
            </div>
          </div>
        </div>
      </main>

      <PrismFooter />
    </div>
  );
};
