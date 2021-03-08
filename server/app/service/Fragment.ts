import { FindAndCountOptions } from 'sequelize/types';
import BaseService from './BaseService';

/**
 * Fragment Service
 */
export default class FragmentService extends BaseService {
  public async create(values: any) {
    const { model } = this.ctx;
    return await model.Fragment.create(values);
  }

  public async list(options: FindAndCountOptions) {
    const { model } = this.ctx;
    return await model.Fragment.findAndCountAll(options);
  }
}
