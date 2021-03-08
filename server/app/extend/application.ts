import { Singleton, Application } from 'egg';
import { Redis } from 'ioredis';

const TRANSACTION = Symbol('Application#transaction');

/**
 * 扩展application
 */
export default {
  testRedis(this: Application) {
    return (this.redis as Singleton<Redis>).get('test');
  },

  // 事务
  async transaction(this: Application) {
    if (!this[TRANSACTION]) {
      // this[TRANSACTION] = await this.model.transaction();
    }
    return this[TRANSACTION];
  },
  getTransaction() {
    return this[TRANSACTION];
  },
  deleteTransaction() {
    this[TRANSACTION] = null;
  },
};
