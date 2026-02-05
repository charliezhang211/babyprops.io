// 📍 src/components/plp/FilterSidebar.tsx
// 产品筛选侧边栏 (React Island)

import { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { $filterState, $hasActiveFilters, $activeFilterCount, clearAllFilters, initFiltersFromURL } from '@/stores/filter';
import ColorFilter from './ColorFilter';
import MaterialFilter from './MaterialFilter';
import PriceRange from './PriceRange';

interface FilterSidebarProps {
  /**
   * 显示模式
   * - "sidebar": 桌面端侧边栏 (默认)
   * - "drawer": 移动端抽屉 (需要触发按钮)
   * @default "sidebar"
   */
  mode?: 'sidebar' | 'drawer';

  /**
   * 侧边栏标题
   * @default "Filters"
   */
  title?: string;

  /**
   * 价格范围配置
   */
  priceConfig?: {
    min?: number;
    max?: number;
    step?: number;
    currency?: string;
  };

  /**
   * 是否显示结果计数 (需要从外部传入)
   */
  resultCount?: number;
}

/**
 * 产品筛选侧边栏组件
 *
 * 功能:
 * - 整合 ColorFilter, MaterialFilter, PriceRange
 * - 桌面端: 固定侧边栏
 * - 移动端: 抽屉模式 (可展开/收起)
 * - "Clear All" 清空所有筛选
 * - 显示激活的筛选数量
 */
export default function FilterSidebar({
  mode = 'sidebar',
  title = 'Filters',
  priceConfig = {},
  resultCount,
}: FilterSidebarProps) {
  const filterState = useStore($filterState);
  const hasActiveFilters = useStore($hasActiveFilters);
  const activeFilterCount = useStore($activeFilterCount);

  // 移动端抽屉状态
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // 初始化: 从 URL 读取筛选状态
  useEffect(() => {
    initFiltersFromURL();
  }, []);

  // 锁定 body 滚动 (当抽屉打开时)
  useEffect(() => {
    if (mode === 'drawer' && isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [mode, isDrawerOpen]);

  const handleClearAll = () => {
    clearAllFilters();
  };

  const handleToggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  // 筛选内容 (复用于侧边栏和抽屉)
  const filterContent = (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-serif text-brand-dark">
          {title}
          {activeFilterCount > 0 && (
            <span className="ml-2 inline-flex items-center justify-center w-6 h-6 text-xs font-medium text-white bg-brand rounded-full">
              {activeFilterCount}
            </span>
          )}
        </h2>

        {mode === 'drawer' && (
          <button
            onClick={handleCloseDrawer}
            className="p-2 -mr-2 text-gray-400 hover:text-brand-dark transition-colors"
            aria-label="Close filters"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Result Count (optional) */}
      {resultCount !== undefined && (
        <div className="text-sm text-gray-600">
          Showing <span className="font-medium text-brand-dark">{resultCount}</span> products
        </div>
      )}

      {/* Clear All Button */}
      {hasActiveFilters && (
        <button
          onClick={handleClearAll}
          className="w-full px-4 py-2 text-sm font-medium text-brand border-2 border-brand rounded-lg hover:bg-brand hover:text-white transition-colors"
        >
          Clear All Filters
        </button>
      )}

      {/* Divider */}
      <div className="border-t border-gray-200"></div>

      {/* Color Filter */}
      <ColorFilter showClearButton={false} />

      {/* Divider */}
      <div className="border-t border-gray-200"></div>

      {/* Material Filter */}
      <MaterialFilter showClearButton={false} />

      {/* Divider */}
      <div className="border-t border-gray-200"></div>

      {/* Price Range */}
      <PriceRange
        showClearButton={false}
        min={priceConfig.min}
        max={priceConfig.max}
        step={priceConfig.step}
        currency={priceConfig.currency}
      />
    </div>
  );

  // 桌面端侧边栏模式
  if (mode === 'sidebar') {
    return (
      <aside
        data-component="filter-sidebar"
        className="w-full lg:w-64 bg-white p-6 rounded-lg shadow-sm border border-gray-200"
      >
        {filterContent}
      </aside>
    );
  }

  // 移动端抽屉模式
  return (
    <>
      {/* Trigger Button (移动端) */}
      <button
        onClick={handleToggleDrawer}
        className="fixed bottom-6 left-6 z-40 flex items-center gap-2 px-4 py-3 bg-brand text-white rounded-full shadow-lg hover:bg-brand-dark transition-colors lg:hidden"
        aria-label="Open filters"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        <span className="font-medium">
          Filters
          {activeFilterCount > 0 && ` (${activeFilterCount})`}
        </span>
      </button>

      {/* Overlay */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 transition-opacity"
          onClick={handleCloseDrawer}
          aria-hidden="true"
        ></div>
      )}

      {/* Drawer Panel */}
      <div
        data-component="filter-drawer"
        className={`
          fixed top-0 left-0 bottom-0 z-50 w-80 max-w-full
          bg-white shadow-2xl overflow-y-auto
          transition-transform duration-300 ease-in-out
          ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="p-6">
          {filterContent}
        </div>
      </div>
    </>
  );
}
