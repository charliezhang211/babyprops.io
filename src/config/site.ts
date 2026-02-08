/**
 * Site Configuration
 * 货币、运费、价格格式化等核心业务配置
 *
 * 职责划分:
 *   site.ts         → 货币/运费/价格格式化 (数据层)
 *   site-settings.ts → 品牌/UI文案/功能开关 (表现层)
 *   lib/payments/    → 支付网关Provider配置 (支付层)
 */

// ============================================
// 货币配置
// ============================================

export const CURRENCY = {
  code: 'USD',           // ISO 4217 货币代码
  symbol: '$',           // 货币符号
  symbolPosition: 'before' as const,  // 'before' | 'after'
  decimalPlaces: 2,      // 小数位数
  decimalSeparator: '.', // 小数分隔符
  thousandSeparator: ',', // 千位分隔符
};

// ============================================
// 运费配置
// ============================================

export const SHIPPING = {
  freeShippingThreshold: 0,  // 0 表示始终免费
  defaultRate: 0,
  currency: CURRENCY.code,
};

// ============================================
// 价格格式化工具
// ============================================

/**
 * 格式化价格显示
 * @param amount 金额（数字）
 * @param options 可选配置
 * @returns 格式化后的价格字符串
 */
export function formatPrice(
  amount: number,
  options?: {
    showSymbol?: boolean;
    showCode?: boolean;
  }
): string {
  const { showSymbol = true, showCode = false } = options || {};

  // 格式化数字
  const parts = amount.toFixed(CURRENCY.decimalPlaces).split('.');
  const integerPart = parts[0].replace(
    /\B(?=(\d{3})+(?!\d))/g,
    CURRENCY.thousandSeparator
  );
  const decimalPart = parts[1];

  let formatted = integerPart;
  if (CURRENCY.decimalPlaces > 0 && decimalPart) {
    formatted += CURRENCY.decimalSeparator + decimalPart;
  }

  // 添加符号
  if (showSymbol) {
    if (CURRENCY.symbolPosition === 'before') {
      formatted = CURRENCY.symbol + formatted;
    } else {
      formatted = formatted + CURRENCY.symbol;
    }
  }

  // 添加货币代码
  if (showCode) {
    formatted += ` ${CURRENCY.code}`;
  }

  return formatted;
}

