import React from 'react';

export default function TabFilters({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'all', label: '전체' },
    { id: 'in-progress', label: '진행 중' },
    { id: 'completed', label: '완료' },
    { id: 'cancelled', label: '취소' }
  ];

  const handleSort = () => {
    // TODO: Implement sort logic
  };

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
      <div className="flex items-center gap-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              activeTab === tab.id
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      <button 
        onClick={handleSort}
        className="px-4 py-2 text-neutral-600 hover:bg-neutral-50 rounded-lg text-sm transition-colors"
      >
        <i className="fa-solid fa-arrow-down-short-wide mr-2"></i>정렬
      </button>
    </div>
  );
}
