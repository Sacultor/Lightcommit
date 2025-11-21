/**
 * 工具函数模块
 * 
 * 功能：提供项目中常用的工具函数
 * 
 * 依赖：
 * - clsx：条件性地拼接类名
 * - tailwind-merge：智能合并 Tailwind CSS 类名，避免冲突
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * cn (classNames) - Tailwind CSS 类名合并工具
 * 
 * 功能：智能合并多个类名，处理条件类名，解决 Tailwind 类名冲突
 * 
 * 为什么需要这个函数？
 * 1. clsx：处理条件类名
 *    例如：clsx('btn', isActive && 'btn-active') → 'btn btn-active' 或 'btn'
 * 
 * 2. twMerge：解决 Tailwind 类名冲突
 *    例如：'px-2 px-4' → 'px-4'（保留后面的，符合 CSS 优先级）
 * 
 * 使用场景：
 * - 组件需要合并默认类名和传入的自定义类名
 * - 根据条件动态添加类名
 * - 避免 Tailwind 类名冲突（如 padding、margin 等）
 * 
 * @param inputs - 任意数量的类名（字符串、对象、数组、条件表达式）
 * @returns 合并后的类名字符串
 * 
 * @example
 * // 基础用法
 * cn('px-2 py-1', 'bg-blue-500')
 * // → 'px-2 py-1 bg-blue-500'
 * 
 * @example
 * // 条件类名
 * cn('btn', isActive && 'btn-active', isDisabled && 'btn-disabled')
 * // → 'btn btn-active' (如果 isActive=true, isDisabled=false)
 * 
 * @example
 * // 解决 Tailwind 冲突（重点！）
 * cn('px-2 py-1', 'px-4')
 * // → 'py-1 px-4' (自动移除冲突的 px-2，保留 px-4)
 * 
 * @example
 * // 组件中的实际应用
 * function Button({ className, ...props }) {
 *   return (
 *     <button
 *       className={cn(
 *         'px-4 py-2 rounded bg-blue-500',  // 默认样式
 *         className                          // 用户自定义样式（可以覆盖默认）
 *       )}
 *       {...props}
 *     />
 *   );
 * }
 * 
 * // 使用时：
 * <Button className="bg-red-500 px-8" />
 * // 最终类名：'py-2 rounded bg-red-500 px-8'
 * // bg-blue-500 被 bg-red-500 覆盖，px-4 被 px-8 覆盖
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
