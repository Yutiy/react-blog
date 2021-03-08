import { Application } from 'egg';

// ip表
export default function(app: Application) {
  const { INTEGER, TEXT, BOOLEAN } = app.Sequelize;

  const IP = app.model.define('ip', {
    id: {
      type: INTEGER({ length: 11 }),
      primaryKey: true,
      autoIncrement: true,
    },
    ip: {
      type: TEXT,
      allowNull: false,
      comment: 'ip地址',
    },
    auth: {
      type: BOOLEAN,
      defaultValue: true,
      comment: '是否可用',
    },
  });

  return class extends IP {
    static associate() {
      app.model.Ip.belongsTo(app.model.User, {
        foreignKey: 'userId',
        targetKey: 'id',
        constraints: false,
      });
    }
  }
}
