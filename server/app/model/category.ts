import { Application } from 'egg';

// 分类表
export default function(app: Application) {
  const { INTEGER, STRING } = app.Sequelize;

  const Category = app.model.define('category', {
    id: {
      type: INTEGER({ length: 11 }),
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: STRING(100),
      allowNull: false,
    },
  });

  return class extends Category {
    static associate() {
      app.model.Category.belongsTo(app.model.Article, {
        as: 'article',
        foreignKey: 'articleId',
        targetKey: 'id',
        constraints: false,
      });
    }
  }
}
