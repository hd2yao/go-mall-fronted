// 格式化价格，输入为分，输出为元，保留2位小数
export function formatPrice(price: number): string {
  return (price / 100).toFixed(2)
}
