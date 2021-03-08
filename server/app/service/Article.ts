import BaseService from './BaseService';

/**
 * Article Service
 */
export default class ArticleService extends BaseService {
  public async findOne(options: any) {
    const { model } = this.ctx;
    return await model.Article.findOne(options);
  }

  public async findAll(options: any) {
    const { model } = this.ctx;
    return await model.Article.findAll(options);
  }

  public async findAndCountAll(options: any) {
    const { model } = this.ctx;
    return await model.Article.findAndCountAll(options);
  }

  public async create(values?: any, options?: any) {
    const { model } = this.ctx;
    return await model.Article.create(values, options);
  }

  public async update(values: any, options: any) {
    const { model } = this.ctx;
    return await model.Article.update(values, options);
  }
}
