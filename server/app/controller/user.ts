import BaseController from './BaseController';
const Joi = require('joi');
const axios = require('axios');

/**
 * 读取 github 用户信息
 * @param {String} username - github 登录名
 */
async function getGithubInfo(username) {
  const result = await axios.get(`https://api.github.com/users/${username}`)
  return result && result.data
}

export default class UserController extends BaseController {
  /**
   * 初始化用户
   */
  public async initGithubUser() {
    const { ctx } = this;
    const { name = 'Yutiy' } = ctx.query;
    try {
      const github = await getGithubInfo(name)
      const temp = await this.find({ id: github.id })
      if (!temp) {
        this.createGithubUser(github, 1)
      }
    } catch (error) {
      console.trace('create github user error ==============>', error.message)
    }
  }

  // 查找用户
  public async find(params) {
    const { service } = this;
    return service.user.findOne({ where: params })
  }

  public async findUser() {
    const { ctx, service } = this;
    const { params, query } = ctx;
    const validator = ctx.validate(
      { ...params, ...query },
      {
        username: Joi.string().required(),
      },
    )
    if (validator) {
      const username = params.username
      const user: any = await service.user.findOne({ where: { username } })
      this.success(user ? { id: user.id } : {})
    }
  }

  // 创建用户
  public async createGithubUser(data, role = 2) {
    const { service } = this;
    const { id, login, email } = data
    return service.user.create({
      id,
      username: login,
      role,
      email,
      github: JSON.stringify(data),
    })
  }

  // 更新用户信息
  public async updateUserById(userId, data) {
    const { service } = this;
    return service.user.update(data, { where: { id: userId } })
  }

  /**
   * 获取用户列表
   */
  public async getList() {
    const { ctx, service } = this;
    const { query } = ctx;
    const validator = ctx.validate(query, {
      username: Joi.string().allow(''),
      type: Joi.number(), // 检索类型 type = 1 github 用户 type = 2 站内用户 不传则检索所有
      'rangeDate[]': Joi.array(),
      page: Joi.string(),
      pageSize: Joi.number(),
    })

    if (validator) {
      const { page = 1, pageSize = 10, username, type } = query
      const rangeDate = query['rangeDate[]']
      const where: any = {
        role: { $not: 1 },
      }

      if (username) {
        where.username = {
          $like: `%${username}%`,
        }
      }

      if (type) {
        where.github = parseInt(type) === 1 ? { $not: null } : null
      }

      if (Array.isArray(rangeDate) && rangeDate.length === 2) {
        where.createdAt = { $between: rangeDate }
      }

      const result = await service.user.findAndCountAll({
        where,
        offset: (page - 1) * pageSize,
        limit: parseInt(pageSize),
        order: [['createdAt', 'DESC']],
      })

      this.success(result);
    }
  }

  /**
   * 删除用户
   */
  public async delete() {
    const { ctx, app, service } = this;
    const { params } = ctx;
    const validator = ctx.validate(ctx.params, {
      userId: Joi.number().required(),
    })

    if (validator) {
      await app.model.query(
        `delete comment, reply from comment left join reply on comment.id=reply.commentId where comment.userId=${params.userId}`,
      )
      await service.user.destroy({ where: { id: params.userId } })
      this.success('删除成功', 204);
    }
  }

  /**
   * 更新用户
   */
  public async updateUser() {
    const { ctx, service } = this;
    const { params, request } = ctx;
    const validator = ctx.validate(
      {
        ...params,
        ...request.body,
      },
      {
        userId: Joi.number().required(),
        notice: Joi.boolean(),
        disabledDiscuss: Joi.boolean(),
      },
    )

    if (validator) {
      const { userId } = params
      const { notice, disabledDiscuss } = request.body
      await this.updateUserById(userId, { notice, disabledDiscuss })
      if (typeof disabledDiscuss !== 'undefined') {
        await service.ip.update({ auth: !disabledDiscuss }, { where: { userId: parseInt(userId) } })
      }
      this.success('操作成功', 204);
    }
  }

  /**
   * 登录
   */
  public async login() {
    const { ctx } = this;
    let code = ctx.request.body.code
    if (!code) {
      code = ctx.query.code
    }

    if (code) {
      await this.githubLogin(code)
    } else {
      await this.defaultLogin()
    }
  }

  /**
   * 注册
   */
  public async register() {
    const { ctx, service } = this;
    const { decryptAES, encrypt } = ctx.helper;
    const validator = ctx.validate(ctx.request.body, {
      username: Joi.string().required(),
      password: Joi.string().required(),
      email: Joi.string().email().required(),
    });

    if (validator) {
      const { username, password, email } = ctx.request.body;
      const result = await service.user.findOne({ where: { email } });
      if (result) {
        this.fail(403, '邮箱已被注册')
      } else {
        const user: any = await service.user.findOne({ where: { username } })
        if (user && !user.github) {
          this.fail(403, '用户名已被占用')
        } else {
          const decryptPassword = decryptAES(password)
          const saltPassword = await encrypt(decryptPassword)
          await service.user.create({ username, password: saltPassword, email })
          this.success('注册成功', 204)
        }
      }
    }
  }

  public async githubLogin(code: string) {
    const { config, service, ctx, app } = this;
    const { passportGithub } = config as any;

    const res = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: passportGithub.key,
      client_secret: passportGithub.secret,
      code,
    })

    const access_token: any = ctx.decodeQuery(res.data)
    if (access_token) {
      // 拿到 access_token 去获取用户信息
      // const result = await axios.get(`${GITHUB.fetch_user_url}?access_token=${access_token['access_token']}`)
      const result = await axios.get('https://api.github.com/user', {
        headers: { Authorization: `token ${access_token.access_token}` },
      })
      const githubInfo = result.data
      let target: any = await service.user.findOne({ id: githubInfo.id }) // 在数据库中查找该用户是否存在
      if (!target) {
        target = await service.user.create({
          id: githubInfo.id,
          username: githubInfo.name || githubInfo.username,
          github: JSON.stringify(githubInfo),
          email: githubInfo.email,
        })
      } else {
        if (target.github !== JSON.stringify(githubInfo)) {
          // github 信息发生了变动
          console.log(`${githubInfo.login}: github 信息发生改变， 更新 user....`)
          const { id, login, email } = githubInfo
          const data = {
            username: login,
            email,
            github: JSON.stringify(githubInfo),
          }
          await this.updateUserById(id, data)
        }
      }

      const token = app.utils.token.createToken({ userId: githubInfo.id, role: target.role }) // 生成 token
      this.success({
        github: githubInfo,
        username: target.username,
        userId: target.id,
        role: target.role,
        token,
      })
    } else {
      this.fail(403, 'github 授权码已失效！')
    }
  }

  public async defaultLogin() {
    const { ctx, service, app } = this;
    const { comparePassword, decryptAES } = ctx.helper;
    const validator = ctx.validate(ctx.request.body, {
      account: Joi.string().required(),
      password: Joi.string(),
    })
    if (validator) {
      const { account, password } = ctx.request.body
      const user: any = await service.user.findOne({
        where: {
          username: account,
        },
      })

      if (!user) {
        this.fail(403, '用户不存在')
      } else {
        const isMatch = await comparePassword(decryptAES(password), user.password)
        if (!isMatch) {
          this.fail(403, '密码不正确')
        } else {
          const { id, role } = user
          const token = app.utils.token.createToken({ username: user.username, userId: id, role }) // 生成 token
          this.success({ username: user.username, role, userId: id, token, email: user.email })
        }
      }
    }
  }
}
