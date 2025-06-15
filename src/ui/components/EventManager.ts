/**
 * 事件管理器
 * 负责管理各种UI事件和回调
 */
export class EventManager {
  private eventListeners: Map<string, Function[]> = new Map();
  private elementListeners: Map<HTMLElement, Array<{event: string, handler: (e: Event) => void}>> = new Map();

  /**
   * 注册事件监听器
   * @param eventName 事件名称
   * @param callback 回调函数
   */
  on(eventName: string, callback: Function) {
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, []);
    }
    this.eventListeners.get(eventName)!.push(callback);
  }

  /**
   * 移除事件监听器
   * @param eventName 事件名称
   * @param callback 回调函数
   */
  off(eventName: string, callback?: Function) {
    if (!this.eventListeners.has(eventName)) {
      return;
    }

    if (callback) {
      const listeners = this.eventListeners.get(eventName)!;
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    } else {
      this.eventListeners.delete(eventName);
    }
  }

  /**
   * 触发事件
   * @param eventName 事件名称
   * @param data 事件数据
   */
  emit(eventName: string, data?: any) {
    if (!this.eventListeners.has(eventName)) {
      return;
    }

    const listeners = this.eventListeners.get(eventName)!;
    listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`事件处理器执行失败: ${eventName}`, error);
      }
    });
  }

  /**
   * 为元素添加事件监听器（自动管理）
   * @param element HTML元素
   * @param event 事件类型
   * @param handler 事件处理器
   */
  addElementListener(element: HTMLElement, event: string, handler: Function) {
    const wrappedHandler = (e: Event) => {
      try {
        handler(e);
      } catch (error) {
        console.error(`元素事件处理器执行失败: ${event}`, error);
      }
    };

    element.addEventListener(event, wrappedHandler);

    // 记录监听器，便于清理
    if (!this.elementListeners.has(element)) {
      this.elementListeners.set(element, []);
    }
    this.elementListeners.get(element)!.push({
      event,
      handler: wrappedHandler
    });
  }

  /**
   * 移除元素的所有事件监听器
   * @param element HTML元素
   */
  removeElementListeners(element: HTMLElement) {
    if (!this.elementListeners.has(element)) {
      return;
    }

    const listeners = this.elementListeners.get(element)!;
    listeners.forEach(({ event, handler }) => {
      element.removeEventListener(event, handler);
    });

    this.elementListeners.delete(element);
  }

  /**
   * 清理所有事件监听器
   */
  cleanup() {
    // 清理自定义事件监听器
    this.eventListeners.clear();

    // 清理元素事件监听器
    this.elementListeners.forEach((listeners, element) => {
      listeners.forEach(({ event, handler }) => {
        element.removeEventListener(event, handler);
      });
    });
    this.elementListeners.clear();
  }

  /**
   * 创建防抖函数
   * @param func 要防抖的函数
   * @param delay 延迟时间（毫秒）
   * @returns 防抖后的函数
   */
  static debounce<T extends (...args: any[]) => any>(func: T, delay: number): T {
    let timeoutId: number;

    return ((...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => func.apply(this, args), delay);
    }) as T;
  }

  /**
   * 创建节流函数
   * @param func 要节流的函数
   * @param delay 延迟时间（毫秒）
   * @returns 节流后的函数
   */
  static throttle<T extends (...args: any[]) => any>(func: T, delay: number): T {
    let lastCall = 0;
    
    return ((...args: any[]) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        return func.apply(this, args);
      }
    }) as T;
  }

  /**
   * 创建单次执行函数
   * @param func 要执行的函数
   * @returns 单次执行的函数
   */
  static once<T extends (...args: any[]) => any>(func: T): T {
    let called = false;
    let result: any;
    
    return ((...args: any[]) => {
      if (!called) {
        called = true;
        result = func.apply(this, args);
      }
      return result;
    }) as T;
  }

  /**
   * 添加大运选择事件监听器
   * @param callback 回调函数
   */
  onDaYunSelect(callback: (index: number) => void) {
    this.on('dayun:select', callback);
  }

  /**
   * 触发大运选择事件
   * @param index 大运索引
   */
  emitDaYunSelect(index: number) {
    this.emit('dayun:select', index);
  }

  /**
   * 添加流年选择事件监听器
   * @param callback 回调函数
   */
  onLiuNianSelect(callback: (year: number) => void) {
    this.on('liunian:select', callback);
  }

  /**
   * 触发流年选择事件
   * @param year 流年年份
   */
  emitLiuNianSelect(year: number) {
    this.emit('liunian:select', year);
  }

  /**
   * 添加流月选择事件监听器
   * @param callback 回调函数
   */
  onLiuYueSelect(callback: (liuYue: any) => void) {
    this.on('liuyue:select', callback);
  }

  /**
   * 触发流月选择事件
   * @param liuYue 流月数据
   */
  emitLiuYueSelect(liuYue: any) {
    this.emit('liuyue:select', liuYue);
  }

  /**
   * 添加十二长生模式切换事件监听器
   * @param callback 回调函数
   */
  onChangShengModeToggle(callback: (mode: number) => void) {
    this.on('changsheng:toggle', callback);
  }

  /**
   * 触发十二长生模式切换事件
   * @param mode 模式
   */
  emitChangShengModeToggle(mode: number) {
    this.emit('changsheng:toggle', mode);
  }

  /**
   * 添加样式切换事件监听器
   * @param callback 回调函数
   */
  onStyleSwitch(callback: (style: string) => void) {
    this.on('style:switch', callback);
  }

  /**
   * 触发样式切换事件
   * @param style 样式
   */
  emitStyleSwitch(style: string) {
    this.emit('style:switch', style);
  }

  /**
   * 添加设置更新事件监听器
   * @param callback 回调函数
   */
  onSettingsUpdate(callback: (settings: any) => void) {
    this.on('settings:update', callback);
  }

  /**
   * 触发设置更新事件
   * @param settings 设置数据
   */
  emitSettingsUpdate(settings: any) {
    this.emit('settings:update', settings);
  }

  /**
   * 添加神煞点击事件监听器
   * @param callback 回调函数
   */
  onShenShaClick(callback: (shenSha: string) => void) {
    this.on('shensha:click', callback);
  }

  /**
   * 触发神煞点击事件
   * @param shenSha 神煞名称
   */
  emitShenShaClick(shenSha: string) {
    this.emit('shensha:click', shenSha);
  }

  /**
   * 添加表格扩展事件监听器
   * @param callback 回调函数
   */
  onTableExtend(callback: (level: string) => void) {
    this.on('table:extend', callback);
  }

  /**
   * 触发表格扩展事件
   * @param level 扩展层级
   */
  emitTableExtend(level: string) {
    this.emit('table:extend', level);
  }

  /**
   * 添加错误事件监听器
   * @param callback 回调函数
   */
  onError(callback: (error: Error) => void) {
    this.on('error', callback);
  }

  /**
   * 触发错误事件
   * @param error 错误对象
   */
  emitError(error: Error) {
    this.emit('error', error);
  }

  /**
   * 添加加载状态变化事件监听器
   * @param callback 回调函数
   */
  onLoadingChange(callback: (loading: boolean) => void) {
    this.on('loading:change', callback);
  }

  /**
   * 触发加载状态变化事件
   * @param loading 是否加载中
   */
  emitLoadingChange(loading: boolean) {
    this.emit('loading:change', loading);
  }
}
