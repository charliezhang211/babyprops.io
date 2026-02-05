// 📍 src/components/plp/MaterialFilter.tsx
// 产品材质筛选器 (React Island)

import { useStore } from '@nanostores/react';
import { $filterState, toggleMaterialFilter, clearMaterialFilters } from '@/stores/filter';
import { materials } from '@/config/materials';
import type { Material } from '@/config/materials';

interface MaterialFilterProps {
  /**
   * 标题文字
   * @default "Filter by Material"
   */
  title?: string;

  /**
   * 显示清空按钮
   * @default true
   */
  showClearButton?: boolean;
}

/**
 * 材质筛选器组件
 *
 * 功能:
 * - 显示所有可用材质的选项
 * - 支持多选材质
 * - 状态自动同步到 URL 参数
 * - 选中状态持久化
 */
export default function MaterialFilter({
  title = 'Filter by Material',
  showClearButton = true,
}: MaterialFilterProps) {
  const filterState = useStore($filterState);

  const handleMaterialClick = (materialSlug: string) => {
    toggleMaterialFilter(materialSlug as any);
  };

  const handleClearClick = () => {
    clearMaterialFilters();
  };

  const selectedCount = filterState.materials.size;

  return (
    <div data-component="material-filter" className="space-y-4">
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
            aria-label="Clear material filters"
          >
            Clear
          </button>
        )}
      </div>

      {/* Material Options List */}
      <div className="space-y-2">
        {materials.map((material) => {
          const isSelected = filterState.materials.has(material.slug as any);

          return (
            <MaterialOption
              key={material.slug}
              material={material}
              isSelected={isSelected}
              onClick={() => handleMaterialClick(material.slug)}
            />
          );
        })}
      </div>
    </div>
  );
}

/**
 * 单个材质选项组件
 */
interface MaterialOptionProps {
  material: Material;
  isSelected: boolean;
  onClick: () => void;
}

function MaterialOption({ material, isSelected, onClick }: MaterialOptionProps) {
  return (
    <button
      onClick={onClick}
      className={`
        group w-full flex items-center gap-3 p-3 rounded-lg text-left
        transition-all duration-200
        ${isSelected
          ? 'bg-brand-light ring-2 ring-brand ring-offset-2'
          : 'bg-white hover:bg-brand-light/50 border border-gray-200'
        }
      `}
      aria-label={`Filter by ${material.name}`}
      aria-pressed={isSelected}
      title={material.description}
    >
      {/* Icon */}
      <div
        className={`
          flex items-center justify-center w-10 h-10 rounded-lg
          transition-all
          ${isSelected
            ? 'bg-brand text-white scale-110'
            : 'bg-gray-100 group-hover:bg-brand/20'
          }
        `}
      >
        <span className="text-2xl">{material.icon}</span>
      </div>

      {/* Material Info */}
      <div className="flex-1 min-w-0">
        <div
          className={`
            text-sm font-medium transition-colors
            ${isSelected ? 'text-brand-dark' : 'text-gray-700 group-hover:text-brand-dark'}
          `}
        >
          {material.name}
        </div>
      </div>

      {/* Checkmark when selected */}
      {isSelected && (
        <div className="flex-shrink-0">
          <svg
            className="w-5 h-5 text-brand"
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
    </button>
  );
}
