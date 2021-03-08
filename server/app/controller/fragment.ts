import BaseController from './BaseController';
const Joi = require('joi');

export default class FragmentController extends BaseController {
  public async create() {
    const { ctx, service } = this;
    const validate = ctx.validate(ctx.request.body, {
      author: Joi.string(),
      content: Joi.string(),
      createAt: Joi.string(),
    });

    if (validate) {
      const { author, content, createAt } = ctx.request.body;
      const data = await service.fragment.create({ author, content, createAt })
      this.success(data);
    }
  }

  public async list() {
    const { service } = this;
    const data = await service.fragment.list({
      attributes: ['id', 'author', 'content', 'createdAt'],
      raw: true,
      order: [['createdAt', 'DESC']],
    });
    this.success(data);
  }
}
