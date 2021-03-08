import BaseController from './BaseController';

export default class TagController extends BaseController {
  public async getTagList() {
    const { model, app } = this.ctx;

    const data = await model.Tag.findAll({
      attributes: ['name', [app.Sequelize.fn('COUNT', app.Sequelize.col('name')), 'count']],
      group: 'name',
      where: {
        articleId: { $not: null },
      },
      order: [[app.Sequelize.fn('COUNT', app.Sequelize.col('name')), 'desc']],
    })

    this.success(data);
  }

  public async getCategoryList() {
    const { model, app } = this.ctx;
    const data = await model.Category.findAll({
      attributes: ['name', [app.Sequelize.fn('COUNT', app.Sequelize.col('name')), 'count']],
      group: 'name',
      where: {
        articleId: { $not: null },
      },
      order: [[app.Sequelize.fn('COUNT', app.Sequelize.col('name')), 'desc']],
    })

    this.success(data);
  }
}
