import { Application } from 'egg';
const moment = require('moment');

// user 表
export default function(app: Application) {
  const { INTEGER, DATE, STRING, TEXT, BOOLEAN, TINYINT, NOW } = app.Sequelize;

  const User = app.model.define('user', {
    id: {
      type: INTEGER({ length: 11 }),
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: STRING(50),
      allowNull: false,
    },
    password: {
      type: STRING,
      comment: '通过 bcrypt 加密后的密码', // 仅限站内注册用户
    },
    email: {
      type: STRING(50),
    },
    notice: {
      type: BOOLEAN, // 是否开启邮件通知
      defaultValue: true,
    },
    role: {
      type: TINYINT,
      defaultValue: 2,
      comment: '用户权限：1 - admin, 2 - 普通用户',
    },
    github: {
      type: TEXT, // github 登录用户 直接绑定在 user 表
    },
    disabledDiscuss: {
      type: BOOLEAN, // 是否禁言
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

  return class extends User {
    static associate() {
      app.model.User.hasMany(app.model.Comment);
      app.model.User.hasMany(app.model.Reply);
      app.model.User.hasMany(app.model.Ip);
    }
  }
}
