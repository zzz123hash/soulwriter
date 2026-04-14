/**
 * SoulWriter Core - Event System
 * 事件总线，实现控制论反馈机制
 */

class EventEmitter {
  constructor() {
    this.events = {};
  }

  on(event, handler) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(handler);
    return this;
  }

  off(event, handler) {
    if (!this.events[event]) return this;
    this.events[event] = this.events[event].filter(h => h !== handler);
    return this;
  }

  emit(event, data) {
    if (!this.events[event]) return;
    this.events[event].forEach(handler => {
      try {
        handler(data);
      } catch (err) {
        console.error(`Event handler error: ${event}`, err);
      }
    });
  }

  once(event, handler) {
    const wrapper = (data) => {
      handler(data);
      this.off(event, wrapper);
    };
    this.on(event, wrapper);
  }
}

// 全局事件总线
const events = new EventEmitter();

// 事件类型
const EventTypes = {
  // 书籍事件
  BOOK_CREATED: 'book:created',
  BOOK_UPDATED: 'book:updated',
  BOOK_DELETED: 'book:deleted',
  
  // 章节事件
  CHAPTER_CREATED: 'chapter:created',
  CHAPTER_UPDATED: 'chapter:updated',
  CHAPTER_DELETED: 'chapter:deleted',
  
  // 插件事件
  PLUGIN_LOADED: 'plugin:loaded',
  PLUGIN_UNLOADED: 'plugin:unloaded',
  
  // 系统事件
  READY: 'system:ready',
  ERROR: 'system:error'
};

module.exports = { events, EventEmitter, EventTypes };
