import { UpdateOptions } from 'sequelize/types';
import BaseService from './BaseService';

/**
 * Ip Service
 */
export default class IpService extends BaseService {
  public async findOne(options: any) {
    const { model } = this.ctx;
    return await model.Ip.findOne(options);
  }

  public async update(values: any, options: UpdateOptions) {
    const { model } = this.ctx;
    return await model.Ip.update(values, options);
  }
}
