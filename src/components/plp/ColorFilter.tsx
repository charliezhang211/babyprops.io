// 📍 src/components/plp/ColorFilter.tsx
// 产品色系筛选器 (React Island)

import { useStore } from '@nanostores/react';
import { $filterState, toggleColorFilter, clearColorFilters } from '@/stores/filter';
import { colorFamilies } from '@/config/color-families';
import type { ColorFamily } from '@/config/color-families';

interface ColorFilterProps {
  /**
   * 标题文字
   * @default "Filter by Color"
   */
  title?: string;

  /**
   * 显示清空按钮
   * @default true
   */
  showClearButton?: boolean;
}

/**
 * 色卡样式筛选器组件
 *
 * 功能:
 * - 显示所有可用色系的色卡
 * - 支持多选颜色
 * - 状态自动同步到 URL 参数
 * - 选中状态持久化
 */
export default function ColorFilter({
  title = 'Filter by Color',
  showClearButton = true,
}: ColorFilterProps) {
  const filterState = useStore($filterState);

  const handleColorClick = (colorSlug: string) => {
    toggleColorFilter(colorSlug as any);
  };

  const handleClearClick = () => {
    clearColorFilters();
  };

  const selectedCount = filterState.colors.size;

  return (
    <div data-component="color-filter" className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-medium text-brand-dark">
          {title}
          {selectedCount > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({selectedCount} selected)
            </span>
          )}
        </h3>

        {showClearButton && selectedCount > 0 && (
          <button
            onClick={handleClearClick}
            className="text-sm text-brand hover:text-brand-dark transition-colors"
            aria-label="Clear color filters"
          >
            Clear
          </button>
        )}
      </div>

      {/* Color Swatches Grid */}
      <div className="grid grid-cols-3 gap-3">
        {colorFamilies.map((color) => {
          const isSelected = filterState.colors.has(color.slug as any);

          return (
            <ColorSwatch
              key={color.slug}
              color={color}
              isSelected={isSelected}
              onClick={() => handleColorClick(color.slug)}
            />
          );
        })}
      </div>
    </div>
  );
}

/**
 * 单个色卡组件
 */
interface ColorSwatchProps {
  color: ColorFamily;
  isSelected: boolean;
  onClick: () => void;
}

function ColorSwatch({ color, isSelected, onClick }: ColorSwatchProps) {
  return (
    <button
      onClick={onClick}
      className={`
        group relative flex flex-col items-center gap-2 p-3 rounded-lg
        transition-all duration-200
        ${isSelected
          ? 'bg-brand-light ring-2 ring-brand ring-offset-2'
          : 'bg-white hover:bg-brand-light/50 border border-gray-200'
        }
      `}
      aria-label={`Filter by ${color.name}`}
      aria-pressed={isSelected}
      title={color.description}
    >
      {/* Color Circle */}
      <div
        className={`
          w-10 h-10 rounded-full border-2 transition-all
          ${isSelected
            ? 'border-brand scale-110 shadow-md'
            : 'border-gray-300 group-hover:border-brand group-hover:scale-105'
          }
        `}
        style={{ backgroundColor: color.displayColor }}
      >
        {/* Checkmark when selected */}
        {isSelected && (
          <div className="flex items-center justify-center w-full h-full">
            <svg
              className="w-5 h-5 text-white drop-shadow-md"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Color Name */}
      <span
        className={`
          text-xs font-medium text-center transition-colors
          ${isSelected ? 'text-brand-dark' : 'text-gray-600 group-hover:text-brand-dark'}
        `}
      >
        {color.name}
      </span>
    </button>
  );
}
