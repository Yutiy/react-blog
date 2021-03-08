import { Context } from 'egg';

export default () => {
  return async (ctx: Context, next: any) => {
    try {
      await next();

      const transaction = await ctx.app.getTransaction();
      if (transaction) { // 如果有事务自动提交
        transaction.commit();
        ctx.app.deleteTransaction();
      }
    } catch (err) {
      // 所有的异常都在 app 上触发一个 error 事件，框架会记录一条错误日志
      if (!err.notError) {
        ctx.app.emit('error', err, ctx);
      }

      // 生产环境时 500 错误的详细错误内容不返回给客户端，因为可能包含敏感信息
      const status = err.status || 500;
      const message = status === 500 && ctx.app.config.env === 'prod' ? 'Internal Server Error' : err.message;

      // 从 error 对象上读出各个属性，设置到响应中
      ctx.status = status;
      ctx.body = { msg: message, code: ctx.ERROR_CODE };
      if (status === 422) ctx.body.detail = err.errors;

      const transaction = await ctx.app.getTransaction();
      if (transaction) { // 如果有事务自动回滚
        transaction.rollback();
        ctx.app.deleteTransaction();
      }
    }
  };
};
