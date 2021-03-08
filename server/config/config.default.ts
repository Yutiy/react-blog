import { EggAppConfig, EggAppInfo, PowerPartial } from 'egg';
import { Op } from 'sequelize';
import { Options } from 'sequelize/types/lib/sequelize';
import { EggRedisOptions, ClusterOptions } from 'egg-redis';
import { Secret } from 'jsonwebtoken';
import path = require('path');

export type DefaultConfig = PowerPartial<EggAppConfig & BizConfig>;
export type sequelizeOptions = Options & {delegate: string, baseDir: string};
export interface BizConfig {
  sequelize: {
    datasources: sequelizeOptions[];
  } | Options;
  redis: EggRedisOptions;
  logrotator: any;
  jwtSecret: Secret;
  monk: {
    database: string | string[];
  };
  oss: {
    accessKeyId: string,
    accessKeySecret: string,
    bucket: string,
    region: string
  };
}

export function getSqlConfig(options: sequelizeOptions | Options) {
  const baseConfig = {
    logging: false,
    dialect: 'mysql',
    host: process.env.MYSQL_HOST || '127.0.0.1',
    username: process.env.MYSQL_USERNAME || 'root',
    password: process.env.MYSQL_PASSWORD || 'Yutiy_7_mysql',
    port: 3306,
    timezone: '+08:00',
    define: {
      underscored: false,
      freezeTableName: true,
      timestamps: false,
    },
    dialectOptions: {
      charset: 'utf8mb4',
      dateStrings: true,
      typeCast(field: any, next: any) {
        if (field.type === 'DATETIME') {
          return field.string();
        }
        return next();
      },
    },
    pool: {
      max: 320,
      min: 0,
      acquire: 1000 * 1000,
      idle: 10000,
    },
    operatorsAliases: {
      $eq: Op.eq,
      $ne: Op.ne,
      $gte: Op.gte,
      $gt: Op.gt,
      $lte: Op.lte,
      $lt: Op.lt,
      $not: Op.not,
      $in: Op.in,
      $notIn: Op.notIn,
      $is: Op.is,
      $like: Op.like,
      $notLike: Op.notLike,
      $iLike: Op.iLike,
      $notILike: Op.notILike,
      $regexp: Op.regexp,
      $notRegexp: Op.notRegexp,
      $iRegexp: Op.iRegexp,
      $notIRegexp: Op.notIRegexp,
      $between: Op.between,
      $notBetween: Op.notBetween,
      $overlap: Op.overlap,
      $contains: Op.contains,
      $contained: Op.contained,
      $adjacent: Op.adjacent,
      $strictLeft: Op.strictLeft,
      $strictRight: Op.strictRight,
      $noExtendRight: Op.noExtendRight,
      $noExtendLeft: Op.noExtendLeft,
      $and: Op.and,
      $or: Op.or,
      $any: Op.any,
      $all: Op.all,
      $values: Op.values,
      $col: Op.col,
    },
  };

  return Object.assign(baseConfig, options);
}

export function getRedisConfig(options: ClusterOptions) {
  const baseConfig = {
    port: 6379,
    host: process.env.REDIS_HOST || '127.0.0.1',
    password: process.env.REDIS_PASSWORD || '',
    db: 13,
  };
  return Object.assign(baseConfig, options);
}

export default (appInfo: EggAppInfo) => {
  const config: DefaultConfig = {};

  // override config from framework / plugin
  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1611560116859_6967';

  config.uuid = {
    name: 'ebuuid',
    maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
  };

  config.security = {
    csrf: { enable: false },
    methodnoallow: { enable: false },
  };

  // add your egg config in here
  config.middleware = ['authHandler', 'errorHandler'];

  config.customLoader = {
    utils: {
      directory: 'app/utils',
      inject: 'app',
      loadunit: false, // 是否加载框架和插件目录
      ignore: 'file',
      // other loads options
    },
  }

  // 按小时切割日志信息
  config.logrotator = {
    filesRotateByHour: [
      path.join(appInfo.root, 'logs', appInfo.name, `${appInfo.name}-web.log`),
      path.join(appInfo.root, 'logs', appInfo.name, 'common-error.log'),
    ],
  };

  config.multipart = {
    mode: 'file',
    fileExtensions: ['', 'txt'],
  };

  config.cors = {
    origin: '*',
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH,OPTIONS',
  };

  config.io = {
    init: { }, // passed to engine.io
    namespace: {
      '/monitor': {
        connectionMiddleware: [],
        packetMiddleware: [],
      },
    },
  };

  config.passportGithub = {
    key: '9e10d40a24fcf2848205',
    secret: 'a743eb5a6902d0a0985cccf1226a636aac0e1ea3',
    // callbackURL: '/passport/github/callback',
    // proxy: false,
  };

  const bizConfig = {
    EMAIL_NOTICE: {
      // 邮件通知服务
      // detail: https://nodemailer.com/
      enable: true, // 开关
      transporterConfig: {
        host: 'smtp.163.com',
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
          user: 'a494657028@163.com', // generated ethereal user
          pass: 'CYOGRIKSNJSVKUBN', // generated ethereal password 授权码 而非 密码
        },
      },
      subject: 'yutiy的博客 - 您的评论获得新的回复！', // 主题
      text: '您的评论获得新的回复！',
      WEB_HOST: 'https://www.ytxcloud.com', // email callback url
    },
  };

  // the return config will combines to EggAppConfig
  return { ...config, ...bizConfig };
};
