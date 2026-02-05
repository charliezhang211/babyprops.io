// 📍 src/components/plp/PriceRange.tsx
// 价格区间筛选器 (React Island)

import { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { $filterState, setPriceRange, clearPriceRange } from '@/stores/filter';

interface PriceRangeProps {
  /**
   * 标题文字
   * @default "Filter by Price"
   */
  title?: string;

  /**
   * 最小价格
   * @default 0
   */
  min?: number;

  /**
   * 最大价格
   * @default 500
   */
  max?: number;

  /**
   * 步进值
   * @default 10
   */
  step?: number;

  /**
   * 货币符号
   * @default "$"
   */
  currency?: string;

  /**
   * 显示清空按钮
   * @default true
   */
  showClearButton?: boolean;
}

/**
 * 价格区间筛选器组件
 *
 * 功能:
 * - 双滑块选择价格区间
 * - 显示当前选中的价格范围
 * - 状态自动同步到 URL 参数
 * - 选中状态持久化
 */
export default function PriceRange({
  title = 'Filter by Price',
  min = 0,
  max = 500,
  step = 10,
  currency = '$',
  showClearButton = true,
}: PriceRangeProps) {
  const filterState = useStore($filterState);

  // 本地状态用于实时更新滑块 (避免每次移动都更新 store)
  const [localMin, setLocalMin] = useState(min);
  const [localMax, setLocalMax] = useState(max);

  // 从 store 初始化本地状态
  useEffect(() => {
    if (filterState.priceRange) {
      setLocalMin(filterState.priceRange[0]);
      setLocalMax(filterState.priceRange[1]);
    } else {
      setLocalMin(min);
      setLocalMax(max);
    }
  }, [filterState.priceRange, min, max]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (value <= localMax) {
      setLocalMin(value);
    }
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (value >= localMin) {
      setLocalMax(value);
    }
  };

  // 当用户松开滑块时,更新 store 和 URL
  const handleMouseUp = () => {
    if (localMin !== min || localMax !== max) {
      setPriceRange(localMin, localMax);
    }
  };

  const handleClearClick = () => {
    clearPriceRange();
    setLocalMin(min);
    setLocalMax(max);
  };

  const isActive = filterState.priceRange !== null;
  const isFiltered = localMin !== min || localMax !== max;

  return (
    <div data-component="price-range-filter" className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-medium text-brand-dark">{title}</h3>

        {showClearButton && isActive && (
          <button
            onClick={handleClearClick}
            className="text-sm text-brand hover:text-brand-dark transition-colors"
            aria-label="Clear price filter"
          >
            Clear
          </button>
        )}
      </div>

      {/* Price Display */}
      <div className="flex items-center justify-between text-sm">
        <div
          className={`
            font-medium transition-colors
            ${isFiltered ? 'text-brand-dark' : 'text-gray-600'}
          `}
        >
          {currency}{localMin}
        </div>
        <div className="text-gray-400">—</div>
        <div
          className={`
            font-medium transition-colors
            ${isFiltered ? 'text-brand-dark' : 'text-gray-600'}
          `}
        >
          {currency}{localMax}
        </div>
      </div>

      {/* Dual Range Sliders */}
      <div className="relative pt-2 pb-4">
        {/* Track Background */}
        <div className="absolute top-1/2 left-0 right-0 h-2 bg-gray-200 rounded-full -translate-y-1/2"></div>

        {/* Active Track (between min and max) */}
        <div
          className="absolute top-1/2 h-2 bg-brand rounded-full -translate-y-1/2 transition-all"
          style={{
            left: `${((localMin - min) / (max - min)) * 100}%`,
            right: `${100 - ((localMax - min) / (max - min)) * 100}%`,
          }}
        ></div>

        {/* Min Slider */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localMin}
          onChange={handleMinChange}
          onMouseUp={handleMouseUp}
          onTouchEnd={handleMouseUp}
          className="range-slider range-slider-min"
          aria-label="Minimum price"
        />

        {/* Max Slider */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localMax}
          onChange={handleMaxChange}
          onMouseUp={handleMouseUp}
          onTouchEnd={handleMouseUp}
          className="range-slider range-slider-max"
          aria-label="Maximum price"
        />
      </div>

      {/* Helper Text */}
      {isFiltered && (
        <p className="text-xs text-gray-500">
          Showing products between {currency}{localMin} and {currency}{localMax}
        </p>
      )}

      <style>{`
        .range-slider {
          position: absolute;
          width: 100%;
          height: 0;
          pointer-events: none;
          -webkit-appearance: none;
          background: transparent;
        }

        .range-slider::-webkit-slider-thumb {
          pointer-events: all;
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #D4A5A5; /* brand color */
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          cursor: pointer;
          transition: all 0.2s;
        }

        .range-slider::-webkit-slider-thumb:hover {
          transform: scale(1.15);
          box-shadow: 0 2px 8px rgba(212, 165, 165, 0.4);
        }

        .range-slider::-moz-range-thumb {
          pointer-events: all;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #D4A5A5; /* brand color */
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          cursor: pointer;
          transition: all 0.2s;
        }

        .range-slider::-moz-range-thumb:hover {
          transform: scale(1.15);
          box-shadow: 0 2px 8px rgba(212, 165, 165, 0.4);
        }

        .range-slider-max {
          position: absolute;
        }
      `}</style>
    </div>
  );
}
