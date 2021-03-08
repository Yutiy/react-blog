import { DefaultConfig, getSqlConfig, getRedisConfig } from './config.default';

export default () => {
  const config: DefaultConfig = {};

  config.jwtSecret = '123456';

  config.oss = {
    accessKeyId: '',
    accessKeySecret: '',
    bucket: '',
    region: '',
  };

  config.sequelize = {
    datasources: [
      getSqlConfig({
        delegate: 'model',
        baseDir: 'model',
        database: 'egg_test',
      }),
    ],
  };

  config.redis = {
    clients: {
      default: getRedisConfig({ db: 0 }),
      subscribe: getRedisConfig({ db: 1 }),
      session: getRedisConfig({ db: 2 }),
    },
    agent: true,
  };

  config.logger = {
    dir: './logs',
    level: 'WARN',
  };

  return config;
};
