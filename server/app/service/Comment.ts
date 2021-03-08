import BaseService from './BaseService';

/**
 * Discuss Service
 */
export default class CommentService extends BaseService {
  public async create(values) {
    const { model } = this.ctx;
    return await model.Comment.create(values);
  }
}
