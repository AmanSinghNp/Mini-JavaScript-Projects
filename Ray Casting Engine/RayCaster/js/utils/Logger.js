/**
 * Development-only logging utility
 * Can be toggled on/off via Config.Debug.loggerEnabled
 */

import { Config } from '../core/Config.js';

export const Logger = {
  /**
   * Check if logging is enabled
   * @returns {boolean}
   */
  get enabled() {
    return Config.Debug.loggerEnabled;
  },

  /**
   * Log informational message (only when enabled)
   * @param  {...any} args - Arguments to log
   */
  log(...args) {
    if (this.enabled) {
      console.log('[RayCaster]', ...args);
    }
  },

  /**
   * Log warning message (only when enabled)
   * @param  {...any} args - Arguments to log
   */
  warn(...args) {
    if (this.enabled) {
      console.warn('[RayCaster]', ...args);
    }
  },

  /**
   * Log error message (always logs - errors should never be silenced)
   * @param  {...any} args - Arguments to log
   */
  error(...args) {
    console.error('[RayCaster]', ...args);
  },

  /**
   * Log debug message with category (only when enabled)
   * @param {string} category - Category/module name
   * @param  {...any} args - Arguments to log
   */
  debug(category, ...args) {
    if (this.enabled) {
      console.log(`[RayCaster:${category}]`, ...args);
    }
  }
};

export default Logger;
