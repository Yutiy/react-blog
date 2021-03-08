import { Application } from 'egg';

// 标签表
export default function(app: Application) {
  const { STRING, INTEGER } = app.Sequelize;

  const Tag = app.model.define('tag', {
    id: {
      type: INTEGER({ length: 11 }),
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: STRING(100),
      allowNull: false,
      unique: true,
    },
  });

  return class extends Tag {
    static associate() {
      app.model.Tag.belongsTo(app.model.Article, {
        as: 'article',
        foreignKey: 'articleId',
        targetKey: 'id',
        constraints: false,
      });
    }
  }
}
