import BaseController from './BaseController';
const Joi = require('joi');

export default class DiscussController extends BaseController {
  public async create() {
    const { service, ctx, config } = this;
    const { request, model } = ctx;
    const validator = ctx.validate(request.body, {
      articleId: Joi.number().required(), // 文章 id
      userId: Joi.number().required(), // 用户 id
      content: Joi.string().required(), // 评论 、回复的内容
      commentId: Joi.number(), // 回复相应的评论
    })

    if (validator) {
      const { articleId, userId, content } = request.body
      let commentId = request.body.commentId

      const user: any = await service.user.findOne({ where: { id: userId } })
      const ipInfo: any = await service.ip.findOne({ where: { ip: request.ip }, attributes: ['auth'] })

      if (ipInfo && !ipInfo.auth) {
        ctx.status = 401
        ctx.response.body = {
          message: '该 IP 已被拉入黑名单',
        }
      } else if (user.disabledDiscuss) {
        ctx.status = 401
        ctx.response.body = {
          message: '您已被禁言，请文明留言！',
        }
      } else {
        const ip = ctx.request.ip
        if (!commentId) {
          // 添加评论
          const comment: any = await service.comment.create({ userId, articleId, content });
          commentId = comment.id
        } else {
          // 添加回复
          await model.Reply.create({ userId, articleId, content, commentId })
        }
        await model.Ip.findOrCreate({ where: { ip }, defaults: { userId, ip } })

        const list = await this.fetchDiscussList(articleId)
        config.EMAIL_NOTICE.enable && service.baseService.sendingEmail(articleId, list, commentId, userId)
        this.success(list);
      }
    }
  }

  public async deleteComment() {
    const { ctx, app } = this;
    const validator = ctx.validate(ctx.params, {
      commentId: Joi.number().required(),
    })

    if (validator) {
      const commentId = ctx.params.commentId
      await app.model.query(
        `delete comment, reply from comment left join reply on comment.id=reply.commentId where comment.id=${commentId}`,
      )
      this.success('操作成功', 204);
    }
  }

  public async deleteReply() {
    const { ctx, service } = this;
    const validator = ctx.validate(ctx.params, {
      replyId: Joi.number().required(),
    })

    if (validator) {
      const replyId = ctx.params.replyId
      await service.discuss.destroy({ where: { id: replyId } })
      this.success('操作成功', 204);
    }
  }

  public async fetchDiscussList(articleId) {
    const { ctx, service } = this;
    const { model } = ctx;
    const data: any = await service.discuss.findAndCountAll({
      where: { articleId },
      attributes: ['id', 'content', 'createdAt'],
      include: [
        {
          model: model.Reply,
          attributes: ['id', 'content', 'createdAt'],
          include: [{ model: model.User, as: 'user', attributes: { exclude: ['updatedAt', 'password'] } }],
        },
        { model: model.User, as: 'user', attributes: { exclude: ['updatedAt', 'password'] } },
      ],
      order: [['createdAt', 'DESC'], [model.Reply, 'createdAt', 'ASC']],
    })

    // 格式化 github
    data.rows.forEach(comment => {
      comment.user.github = JSON.parse(comment.user.github)
      comment.replies.forEach(reply => {
        reply.user.github = JSON.parse(reply.user.github)
      })
    })

    return data
  }
}
