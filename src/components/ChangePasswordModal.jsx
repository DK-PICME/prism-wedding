import { useState } from 'react';

export const ChangePasswordModal = ({
  isOpen,
  isLoading,
  error,
  success,
  onClose,
  onSubmit,
}) => {
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');

  const handleSubmit = async () => {
    await onSubmit(currentPasswordInput, newPasswordInput, newPasswordConfirm);
    // 성공 시 입력값 초기화
    if (!error) {
      setCurrentPasswordInput('');
      setNewPasswordInput('');
      setNewPasswordConfirm('');
    }
  };

  const handleCancel = () => {
    setCurrentPasswordInput('');
    setNewPasswordInput('');
    setNewPasswordConfirm('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4">
        {/* 헤더 */}
        <div className="border-b border-neutral-200 p-6">
          <h2 className="text-xl font-semibold text-neutral-900">비밀번호 변경</h2>
        </div>

        {/* 컨텐츠 */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">현재 비밀번호</label>
            <input
              type="password"
              placeholder="현재 비밀번호 입력"
              value={currentPasswordInput}
              onChange={(e) => setCurrentPasswordInput(e.target.value)}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500 disabled:bg-neutral-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">새 비밀번호</label>
            <input
              type="password"
              placeholder="새 비밀번호 입력"
              value={newPasswordInput}
              onChange={(e) => setNewPasswordInput(e.target.value)}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500 disabled:bg-neutral-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">새 비밀번호 확인</label>
            <input
              type="password"
              placeholder="새 비밀번호 다시 입력"
              value={newPasswordConfirm}
              onChange={(e) => setNewPasswordConfirm(e.target.value)}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500 disabled:bg-neutral-50"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
              {success}
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="border-t border-neutral-200 p-6 flex gap-3">
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 hover:bg-neutral-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-neutral-900 text-white hover:bg-neutral-800 rounded-lg transition-colors disabled:bg-neutral-400 disabled:cursor-not-allowed font-medium"
          >
            {isLoading ? '변경 중...' : '변경'}
          </button>
        </div>
      </div>
    </div>
  );
};
