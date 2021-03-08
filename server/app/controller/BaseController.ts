import { Controller } from 'egg';

// 状态码的匹配列表
const codeMapList = [
  { code: 200, message: '请求成功' },
  { code: 201, message: '新建或修改数据成功。' },
  { code: 202, message: '请求进入后台队列' },
  { code: 204, message: '请求成功' },
  { code: 400, message: '请求失败' },
  { code: 401, message: 'token失效' },
  { code: 403, message: '禁止访问' },
  { code: 404, message: '请求失败' },
  { code: 406, message: '请求方式错误' },
  { code: 408, message: '请求超时' },
  { code: 500, message: '服务器错误' },
  { code: 502, message: '网关错误' },
  { code: 503, message: '服务不可用' },
  { code: 504, message: '网关超时' },
]

export default class BaseController extends Controller {
  public async index() {
    const { ctx } = this;
    ctx.body = await ctx.service.baseService.sayHi('egg');
  }

  get user() {
    return this.ctx.session.user;
  }

  success(data: any, code = this.ctx.SUCCESS_CODE, msg?: string) {
    const item = codeMapList.find(d => d.code === code);
    const targetMessage = item ? item.message : '';

    this.ctx.body = { code, data, msg: msg || targetMessage };
    this.ctx.status = code || 200;
  }

  fail(code: number, message: string) {
    this.ctx.body = { code, message, data: {} };
    this.ctx.status = code || 200;
  }

  notFound(msg: string) {
    msg = msg || 'not found';
    this.ctx.throw(404, msg);
  }
}
