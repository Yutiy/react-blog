import { DestroyOptions, FindAndCountOptions } from 'sequelize/types';
import BaseService from './BaseService';

/**
 * User Service
 */
export default class UserService extends BaseService {
  public async findOne(options: any) {
    const { model } = this.ctx;
    return await model.User.findOne(options);
  }

  public async findAndCountAll(options: FindAndCountOptions) {
    const { model } = this.ctx;
    return await model.User.findAndCountAll(options);
  }

  public async create(options) {
    const { model } = this.ctx;
    return await model.User.create(options);
  }

  public async update(values, options) {
    const { model } = this.ctx;
    return await model.User.create(values, options);
  }

  public async destroy(options: DestroyOptions) {
    const { model } = this.ctx;
    return await model.User.destroy(options);
  }
}
