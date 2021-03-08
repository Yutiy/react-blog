import { Application } from 'egg';

// fragment表
export default function(app: Application) {
  const { STRING, INTEGER, DATE } = app.Sequelize;

  const Fragment = app.model.define('fragment', {
    id: {
      type: INTEGER({ length: 11 }),
      primaryKey: true,
      autoIncrement: true,
    },
    author: {
      type: STRING(100),
      allowNull: false,
    },
    content: {
      type: STRING(100),
      allowNull: true,
      comment: '是否可用',
    },
    createdAt: DATE,
  });

  return class extends Fragment {}
}
