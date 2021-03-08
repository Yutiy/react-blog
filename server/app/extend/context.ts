import { Context } from 'egg';
const Joi = require('joi');

/**
 * 扩展context
 */
export default {
  SUCCESS_CODE: 200, // 成功
  PARAM_ERROR: 400, // 参数错误
  UNAUTHORIZED: 401, // 未登录
  NOT_FOUND: 404, // NOT_FOUND
  ERROR_CODE: 500, // 服务器错误

  isProd(this: Context) {
    return this.app.config.env === 'prod';
  },

  isAjax(this: Context) {
    return this.get('X-Requested-With') === 'XMLHttpRequest';
  },

  /**
   *
   * 解码 url 请求
   * @param {String} url url
  */
  decodeQuery(url: string) {
    const params = {}
    const paramsStr = url.replace(/(\S*)\?/, '') // a=1&b=2&c=&d=xxx&e
    paramsStr.split('&').forEach(v => {
      const d = v.split('=')
      if (d[1] && d[0]) params[d[0]] = d[1]
    })
    return params
  },

  validate(this: Context, params = {}, schema = {}) {
    const mySchema = Joi.object().keys(schema);
    const validator = mySchema.validate(params, { allowUnknown: true });
    if (validator.error) {
      this.throw(400, validator.error.message);
    }
    return true;
  },
};
