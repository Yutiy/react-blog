import { Application } from 'egg';
const moment = require('moment');

// 文章表
export default function(app: Application) {
  const { INTEGER, STRING, TEXT, BOOLEAN, DATE, NOW } = app.Sequelize;

  const Article = app.model.define('article', {
    id: {
      type: INTEGER({ length: 11 }),
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: STRING(255),
      allowNull: false,
      unique: true,
    },
    content: {
      type: TEXT,
    },
    viewCount: { // 阅读数
      type: INTEGER,
      defaultValue: 0,
    },
    type: { // 是否私密
      type: BOOLEAN,
      defaultValue: true,
    },
    top: {
      type: BOOLEAN,
      defaultValue: false,
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

  return class extends Article {
    static associate() {
      app.model.Article.hasMany(app.model.Tag);
      app.model.Article.hasMany(app.model.Category);
      app.model.Article.hasMany(app.model.Comment);
      app.model.Article.hasMany(app.model.Reply);
    }
  }
}
