import BaseService from './BaseService';

/**
 * Record Service
 */
export default class RecordService extends BaseService {
  public async findAll(options) {
    const { model } = this.ctx;
    return await model.Record.findAll(options);
  }

  public async create(values, options?) {
    const { model } = this.ctx;
    return await model.Record.create(values, options);
  }
}
