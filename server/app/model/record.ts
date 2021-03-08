import { Application } from 'egg';
const moment = require('moment');

// 记录表
export default function(app: Application) {
  const { INTEGER, DATE, NOW } = app.Sequelize;

  const Record = app.model.define('record', {
    id: {
      type: INTEGER({ length: 11 }),
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: INTEGER({ length: 11 }),
    },
    articleId: {
      type: INTEGER({ length: 11 }),
    },
    recordTime: {
      type: DATE,
      defaultValue: NOW,
      get() {
        return moment(this.getDataValue('updatedAt')).format('YYYY-MM-DD HH:mm:ss')
      },
    },
  });

  return class extends Record {}
}
