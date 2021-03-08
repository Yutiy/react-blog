import BaseController from './BaseController';

export default class RecordController extends BaseController {
  public async fetchRecordByDay() {
    const { ctx, service } = this;
    const { app } = ctx;

    const data: any = await service.record.findAll({
      attributes: [
        'articleId',
        [app.Sequelize.fn('DATE', app.Sequelize.col('recordTime')), 'time'],
        [app.Sequelize.fn('count', app.Sequelize.col('recordTime')), 'cnt'],
      ],
      group: ['articleId', app.Sequelize.fn('DATE', app.Sequelize.col('recordTime'))],
      order: ['articleId'],
    })
    data.forEach(v => {
      v.articleId = v.articleId.toString()
    })
    this.success(data);
  }
}
