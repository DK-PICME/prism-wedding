import React, { useState } from 'react';
import SearchAndFilter from './OrderHistory/SearchAndFilter';
import TabFilters from './OrderHistory/TabFilters';
import { OrderEmptyState } from './OrderEmptyState';
import FeatureCards from './OrderHistory/FeatureCards';
import GettingStartedCard from './OrderHistory/GettingStartedCard';

export default function OrderHistoryMain({ onCreateOrder }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleFilter = () => {
    // TODO: Implement filter logic
  };

  return (
    <main className="flex-1 bg-white">
      <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="max-w-[1376px] mx-auto">
          
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl lg:text-3xl text-neutral-900">주문 내역</h1>
              <p className="text-sm text-neutral-600 mt-1">주문 현황과 진행 상태를 확인하세요</p>
            </div>
            
            <SearchAndFilter 
              onSearch={handleSearch}
              onFilter={handleFilter}
            />
          </div>

          {/* Filters and Empty State */}
          <div className="bg-white border border-neutral-200 rounded-2xl mb-8">
            <TabFilters 
              activeTab={activeTab} 
              onTabChange={setActiveTab}
            />
            <OrderEmptyState onCreateOrder={onCreateOrder} />
          </div>

          {/* Feature Cards */}
          <FeatureCards />

          {/* Getting Started Card */}
          <GettingStartedCard />

        </div>
      </div>
    </main>
  );
}
