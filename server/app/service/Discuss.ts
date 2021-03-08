import { DestroyOptions, FindAndCountOptions } from 'sequelize/types';
import BaseService from './BaseService';

/**
 * Discuss Service
 */
export default class DiscussService extends BaseService {
  public async create(payload) {
    const { model } = this.ctx;
    return await model.User.create(payload);
  }

  public async destroy(options: DestroyOptions) {
    const { model } = this.ctx;
    return await model.Reply.destroy(options);
  }

  public async findAndCountAll(options: FindAndCountOptions) {
    const { model } = this.ctx;
    return await model.Comment.findAndCountAll(options);
  }
}
