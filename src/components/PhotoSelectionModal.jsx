import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function PhotoSelectionModal({ isOpen, onClose }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleNavigateToPhotoManagement = () => {
    onClose();
    navigate('/photo-management');
  };

  const handleBackgroundClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={handleBackgroundClick}
    >
      <div className="bg-white rounded-3xl w-full max-w-2xl relative pt-16 pb-12 px-8 shadow-2xl text-center">
        
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-neutral-200 rounded-full p-6 shadow-sm border-4 border-white">
          <i className="fa-solid fa-wand-magic-sparkles text-4xl text-neutral-700"></i>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-6 mt-4">
          완벽한 보정의 시작
        </h1>
        
        <div className="space-y-2 mb-10">
          <p className="text-lg md:text-xl text-neutral-600 font-medium">
            먼저 마음에 드는 사진들을 업로드 후 선택해주세요.
          </p>
          <p className="text-lg md:text-xl text-neutral-600 font-medium">
            프리즘이 센스있게 보정해드릴게요! ✨
          </p>
        </div>

        <button
          onClick={handleNavigateToPhotoManagement}
          className="w-full bg-neutral-900 hover:bg-black text-white text-lg md:text-xl font-medium py-5 px-6 rounded-xl transition-colors duration-200"
        >
          지금 시작하기
        </button>

      </div>
    </div>
  );
}
