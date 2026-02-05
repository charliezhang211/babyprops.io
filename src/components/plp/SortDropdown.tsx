// 📍 src/components/plp/SortDropdown.tsx
// 产品排序下拉组件

import { useStore } from '@nanostores/react';
import { $currentSort, setSortOption, type SortOption } from '@/stores/filter';
import { useState, useRef, useEffect } from 'react';

/**
 * 排序选项配置
 */
const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest' },
];

export default function SortDropdown() {
  const currentSort = useStore($currentSort);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 当前选项的标签
  const currentLabel = SORT_OPTIONS.find(opt => opt.value === currentSort)?.label || 'Featured';

  /**
   * 处理排序选择
   */
  const handleSelectSort = (sort: SortOption) => {
    setSortOption(sort);
    setIsOpen(false);
  };

  /**
   * 点击外部关闭下拉菜单
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  /**
   * 键盘导航支持
   */
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div
      ref={dropdownRef}
      className="relative inline-block text-left"
      data-component="sort-dropdown"
      onKeyDown={handleKeyDown}
    >
      {/* 下拉按钮 */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-between w-full min-w-[200px] px-4 py-2.5 text-sm font-medium text-brand-dark bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 transition-colors"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2">
          <svg
            className="w-4 h-4 text-brand"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"
            />
          </svg>
          <span>Sort: {currentLabel}</span>
        </span>
        <svg
          className={`ml-2 h-5 w-5 text-brand-dark transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 下拉菜单 */}
      {isOpen && (
        <div className="absolute right-0 z-20 mt-2 w-56 origin-top-right bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1" role="listbox">
            {SORT_OPTIONS.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelectSort(option.value)}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                  currentSort === option.value
                    ? 'bg-brand-light text-brand-dark font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                role="option"
                aria-selected={currentSort === option.value}
              >
                <span className="flex items-center justify-between">
                  <span>{option.label}</span>
                  {currentSort === option.value && (
                    <svg
                      className="w-5 h-5 text-brand"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
