import React from 'react';

export default function SearchAndFilter({ onSearch, onFilter }) {
  const handleSearchChange = (e) => {
    onSearch(e.target.value);
  };

  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-1 sm:flex-initial sm:w-64">
        <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"></i>
        <input 
          type="text" 
          placeholder="주문 검색..." 
          onChange={handleSearchChange}
          className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"
        />
      </div>
      <button 
        onClick={onFilter}
        className="px-4 py-2 border border-neutral-300 hover:bg-neutral-50 text-neutral-700 rounded-lg transition-colors text-sm whitespace-nowrap"
      >
        <i className="fa-solid fa-filter mr-2"></i>필터
      </button>
    </div>
  );
}
