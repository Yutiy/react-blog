import { DefaultConfig, getSqlConfig, getRedisConfig } from './config.default';

export default () => {
  const config: DefaultConfig = {};

  config.jwtSecret = '654321';

  config.oss = {
    accessKeyId: process.env.OSS_ID,
    accessKeySecret: process.env.OSS_SECRET,
    bucket: process.env.OSS_BUCKET,
    region: process.env.OSS_REGION,
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
    level: 'INFO',
  };

  return config;
};
