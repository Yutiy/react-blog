import { Application } from 'egg';
const moment = require('moment');

// 评论表
export default function(app: Application) {
  const { INTEGER, DATE, NOW, TEXT } = app.Sequelize;

  const Comment = app.model.define('comment', {
    id: {
      type: INTEGER({ length: 11 }),
      primaryKey: true,
      autoIncrement: true,
    },
    articleId: INTEGER({ length: 11 }), // 评论所属文章 id
    content: { type: TEXT, allowNull: false }, // 评论详情
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

  return class extends Comment {
    static associate() {
      app.model.Comment.belongsTo(app.model.Article, {
        as: 'article',
        foreignKey: 'articleId',
        targetKey: 'id',
        constraints: false,
      });

      app.model.Comment.belongsTo(app.model.User, {
        foreignKey: 'userId',
        targetKey: 'id',
        constraints: false,
      });

      app.model.Comment.hasMany(app.model.Reply, {
        foreignKey: 'commentId',
        sourceKey: 'id',
        constraints: false, // 在表之间添加约束意味着当使用 sequelize.sync 时，表必须以特定顺序在数据库中创建表。我们可以向其中一个关联传递
      })
    }
  }
}
