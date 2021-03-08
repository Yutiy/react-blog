import { Application } from 'egg';
const moment = require('moment');

// 回复表
export default function(app: Application) {
  const { INTEGER, DATE, TEXT, NOW } = app.Sequelize;

  const Reply = app.model.define('reply', {
    id: {
      type: INTEGER({ length: 11 }),
      primaryKey: true,
      autoIncrement: true,
    },
    content: {
      type: TEXT,
      allowNull: false,
      comment: '评论详情',
    },
    createdAt: {
      type: DATE,
      defaultValue: NOW,
      get() {
        return moment(this.getDataValue('createdAt')).format('YYYY-MM-DD HH:mm:ss')
      },
    },
    updatedAt: {
      type: DATE,
      defaultValue: NOW,
      get() {
        return moment(this.getDataValue('updatedAt')).format('YYYY-MM-DD HH:mm:ss')
      },
    },
  }, {
    timestamps: true,
  });

  return class extends Reply {
    static associate() {
      app.model.Reply.belongsTo(app.model.User, {
        foreignKey: 'userId',
        targetKey: 'id',
        constraints: false,
      });
    }
  }
}

