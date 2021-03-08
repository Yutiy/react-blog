import BaseController from './BaseController';
const Joi = require('joi');
const fs = require('fs')
const archiver = require('archiver') // 打包 zip
const send = require('koa-send') // 文件下载
const { uploadPath, outputPath, findOrCreateFilePath, decodeFile, generateFile } = require('../utils/file')

export default class ArticleController extends BaseController {
  // 初始化数据 关于页面（用于评论关联）
  public async initAboutPage() {
    const { service } = this;
    const result = await service.article.findOne({ where: { id: -1 } })
    if (!result) {
      await service.article.create({
        id: -1,
        title: '关于页面',
        content: '关于页面存档，勿删',
      })
      this.success('文章创建成功')
    } else {
      this.success('存档文章已存在')
    }
  }

  // 创建文章
  public async create() {
    const { ctx, service } = this;
    const { model } = ctx;
    const validator = ctx.validate(ctx.request.body, {
      authorId: Joi.number().required(),
      title: Joi.string().required(),
      content: Joi.string(),
      categoryList: Joi.array(),
      tagList: Joi.array(),
      type: Joi.boolean(),
      top: Joi.boolean(),
    });

    if (validator) {
      const { title, content, categoryList = [], tagList = [], authorId, type, top } = ctx.request.body
      const result = await service.article.findOne({ where: { title } })
      if (result) {
        ctx.throw(403, '创建失败，该文章已存在！')
      } else {
        const tags = tagList.map((t: string) => ({ name: t }))
        const categories = categoryList.map((c: string) => ({ name: c }))
        const data = await service.article.create(
          { title, content, authorId, tags, categories, type, top },
          { includes: [model.Tag, model.Category] },
        )
        this.success(data)
      }
    }
  }

  // 删除文章
  public async delete() {
    const { ctx, app } = this;
    const validator = ctx.validate(ctx.params, {
      id: Joi.number().required(),
    })

    if (validator) {
      const articleId = ctx.params.id
      await app.model.query(
        `delete comment, reply, category, tag, article
        from article
        left join reply on article.id=reply.articleId
        left join comment on article.id=comment.articleId
        left join category on article.id=category.articleId
        left join tag on article.id=tag.articleId
        where article.id=${articleId}`,
      )
      ctx.status = 204
    }
  }

  // 删除多个文章
  public async delList() {
    const { ctx, app } = this;
    const validator = ctx.validate(ctx.params, {
      list: Joi.string().required(),
    })

    if (validator) {
      const list = ctx.params.list.split(',')
      await app.model.query(
        `delete comment, reply, category, tag, article
        from article
        left join reply on article.id=reply.articleId
        left join comment on article.id=comment.articleId
        left join category on article.id=category.articleId
        left join tag on article.id=tag.articleId
        where article.id in (${list})`,
      )
      ctx.status = 204
    }
  }

  // 修改文章
  public async update() {
    const { ctx, service } = this;
    const { params, request } = ctx;
    const validator = ctx.validate(
      {
        articleId: params.id,
        ...request.body,
      },
      {
        articleId: Joi.number().required(),
        title: Joi.string(),
        content: Joi.string(),
        categories: Joi.array(),
        tags: Joi.array(),
        type: Joi.boolean(),
        top: Joi.boolean(),
      },
    )

    if (validator) {
      const articleId = parseInt(params.id)
      const { title, content, categories = [], tags = [], type, top } = request.body
      const tagList = tags.map(tag => ({ name: tag, articleId }))
      const categoryList = categories.map(cate => ({ name: cate, articleId }))

      await service.article.update({ title, content, type, top }, { where: { id: articleId } })
      await service.tag.destroy({ where: { articleId } })
      await service.tag.bulkCreate(tagList)
      await service.category.destroy({ where: { articleId } })
      await service.category.bulkCreate(categoryList)
      this.success({ type });
    }
  }

  // 创建文章
  public async findById() {
    const { ctx, service } = this;
    const { model, query, params } = ctx;
    const { type = 1 } = query;

    const validator = ctx.validate(
      { ...params, ...query },
      {
        id: Joi.number().required(),
        type: Joi.number(), // type 用于区分是否增加浏览次数 1 新增浏览次数 0 不新增
      },
    );

    if (validator) {
      const data: any = await service.article.findOne({
        where: { id: params.id },
        include: [
          // 查找 分类 标签 评论 回复...
          { model: model.Tag, attributes: ['name'] },
          { model: model.Category, attributes: ['name'] },
          {
            model: model.Comment,
            attributes: ['id', 'content', 'createdAt'],
            include: [
              {
                model: model.Reply,
                attributes: ['id', 'content', 'createdAt'],
                include: [{ model: model.User, as: 'user', attributes: { exclude: ['updatedAt', 'password'] } }],
              },
              { model: model.User, as: 'user', attributes: { exclude: ['updatedAt', 'password'] } },
            ],
            row: true,
          },
        ],
        order: [[model.Comment, 'createdAt', 'DESC'], [[model.Comment, model.Reply, 'createdAt', 'ASC']]], // comment model order
      })

      if (type === 1) {
        service.article.update({ viewCount: ++data.viewCount }, { where: { id: params.id } }); // viewer count ++
        service.record.create({ articleId: params.id }); // 每个浏览记录都存一个stamp，这样后续能够看出文章的阅读趋势方便推荐
      }

      // JSON.parse(github)
      data.comments.forEach(comment => {
        comment.user.github = JSON.parse(comment.user.github)
        comment.replies.forEach(reply => {
          reply.user.github = JSON.parse(reply.user.github)
        })
      })

      this.success(data);
    }
  }

  // 获取文章列表
  public async getList() {
    const { ctx, service } = this;
    const { model } = ctx;
    const validator = ctx.validate(ctx.query, {
      page: Joi.string(),
      pageSize: Joi.number(),
      keyword: Joi.string().allow(''), // 关键字查询
      category: Joi.string(),
      tag: Joi.string(),
      preview: Joi.number(),
      order: Joi.string(),
      type: Joi.boolean(),
    })

    if (validator) {
      const { page = 1, pageSize = 10, preview = 1, keyword = '', tag, category, order, type = null } = ctx.query
      const tagFilter = tag ? { name: tag } : null
      const categoryFilter = category ? { name: category } : null

      let articleOrder = [['createdAt', 'DESC']]
      if (order) {
        articleOrder = [order.split(' ')]
      }

      let options: any = {
        include: [
          { model: model.Tag, attributes: ['name'], where: tagFilter },
          { model: model.Category, attributes: ['name'], where: categoryFilter },
          {
            model: model.Comment,
            attributes: ['id'],
            include: [{ model: model.Reply, attributes: ['id'] }],
          },
        ],
        offset: (page - 1) * pageSize,
        limit: parseInt(pageSize),
        order: articleOrder,
      }

      if (type != null) {
        options = {
          where: {
            id: {
              $not: -1, // 过滤关于页面的副本
            },
            $and: {
              type: {
                $eq: JSON.parse(type),
              },
            },
            $or: {
              title: {
                $like: `%${keyword}%`,
              },
              content: {
                $like: `%${keyword}%`,
              },
            },
          },
          ...options,
        }
      } else {
        options = {
          where: {
            id: {
              $not: -1, // 过滤关于页面的副本
            },
            $or: {
              title: {
                $like: `%${keyword}%`,
              },
              content: {
                $like: `%${keyword}%`,
              },
            },
          },
          ...options,
        }
      }

      const data: any = await service.article.findAndCountAll(options)
      if (preview === 1) {
        data.rows.forEach(d => {
          d.content = d.content.slice(0, 1000) // 只是获取预览，减少打了的数据传输。。。
        })
      }
      data.rows = data.rows.sort((a, b) => b.top - a.top)
      ctx.body = data
    }
  }

  /**
   * 确认文章是否存在
   * @response existList: 数据库中已存在有的文章（包含文章的具体内容）
   * @response noExistList: 解析 md 文件 并且返回数据库中不存在的 具体有文件名 解析后的文件标题
  */
  public async checkExist() {
    const { service, ctx } = this;
    const validator = ctx.validate(ctx.request.body, {
      fileNameList: Joi.array().required(),
    })

    if (validator) {
      const { fileNameList } = ctx.request.body
      const list = await Promise.all(
        fileNameList.map(async fileName => {
          const filePath = `${uploadPath}/${fileName}`
          const file = decodeFile(filePath)
          const title = file.title || fileName.replace(/\.md/, '')
          const article: any = await service.article.findOne({ where: { title }, attributes: ['id'] })
          const result: any = { fileName, title }
          if (article) {
            result.exist = true
            result.articleId = article.id
          }
          return result
        }),
      )
      this.success(list)
    }
  }

  // 上传文章
  public async upload() {
    const { ctx } = this;
    const { file } = ctx.request.files as any // 获取上传文件

    await findOrCreateFilePath(uploadPath) // 创建文件目录
    const upload = file => {
      const reader = fs.createReadStream(file.path) // 创建可读流
      const fileName = file.name
      const filePath = `${uploadPath}/${fileName}`
      const upStream = fs.createWriteStream(filePath)
      reader.pipe(upStream)

      reader.on('end', function() {
        console.log('上传成功')
      })
    }
    Array.isArray(file) ? file.forEach(it => upload(it)) : upload(file)
    ctx.status = 204
  }

  // 确认插入文章
  public async uploadConfirm() {
    const { ctx, service, app } = this;
    const { model } = app;
    const validator = ctx.validate(ctx.request.body, {
      authorId: Joi.number(),
      uploadList: Joi.array(),
    })

    if (validator) {
      const { uploadList, authorId } = ctx.request.body
      await findOrCreateFilePath(uploadPath) // 检查目录

      const _parseList = list => {
        return list.map(item => {
          const filePath = `${uploadPath}/${item.fileName}`
          const result = decodeFile(filePath)
          const { title, date, categories = [], tags = [], content } = result
          const data: any = {
            title: title || item.fileName.replace(/\.md/, ''),
            categories: categories.map(d => ({ name: d })),
            tags: tags.map(d => ({ name: d })),
            content,
            authorId,
          }
          if (date) data.createdAt = date
          if (item.articleId) data.articleId = item.articleId
          return data
        })
      }

      const list = _parseList(uploadList)
      const updateList = list.filter(d => !!d.articleId)
      const insertList = list.filter(d => !d.articleId)

      // 插入文章
      const insertResultList = await Promise.all(
        insertList.map(data => service.article.create(data, { include: [model.Tag, model.Category] })),
      )

      const updateResultList = await Promise.all(
        updateList.map(async data => {
          const { title, content, categories = [], tags = [], articleId } = data
          await service.article.update({ title, content }, { where: { id: articleId } })
          await service.tag.destroy({ where: { articleId } })
          await service.tag.bulkCreate(tags)
          await service.category.destroy({ where: { articleId } })
          await service.category.bulkCreate(categories)
          return service.article.findOne({ where: { id: articleId } })
        }),
      )

      ctx.body = { message: 'success', insertList: insertResultList, updateList: updateResultList }
    }
  }

  // 导出文章
  public async output() {
    const { ctx, service, app } = this;
    const { model } = app;
    const validator = ctx.validate(ctx.params, {
      id: Joi.number().required(),
    })

    if (validator) {
      const article = await service.article.findOne({
        where: { id: ctx.params.id },
        include: [
          // 查找 分类
          { model: model.Tag, attributes: ['name'] },
          { model: model.Category, attributes: ['name'] },
        ],
      })

      const { fileName } = await generateFile(article)
      ctx.attachment(decodeURI(fileName))
      await send(ctx, fileName, { root: outputPath })
    }
  }

  public async outputList() {
    const { ctx, service, app } = this;
    const { model } = app;
    const validator = ctx.validate(ctx.params, {
      list: Joi.string().required(),
    })

    if (validator) {
      const articleList = ctx.params.list.split(',')

      const list = await service.article.findAll({
        where: {
          id: articleList,
        },
        include: [
          // 查找 分类
          { model: model.Tag, attributes: ['name'] },
          { model: model.Category, attributes: ['name'] },
        ],
      })

      await Promise.all(list.map(article => generateFile(article)))

      // 打包压缩 ...
      const zipName = 'mdFiles.zip'
      const zipStream = fs.createWriteStream(`${outputPath}/${zipName}`)
      const zip = archiver('zip')
      zip.pipe(zipStream)
      list.forEach((item: any) => {
        zip.append(fs.createReadStream(`${outputPath}/${item.title}.md`), {
          name: `${item.title}.md`, // 压缩文件名
        })
      })
      await zip.finalize()

      ctx.attachment(decodeURI(zipName))
      await send(ctx, zipName, { root: outputPath })
    }
  }

  public async outputAll() {
    const { service, app, ctx } = this;
    const { model } = app;
    const list = await service.article.findAll({
      where: {
        id: {
          $not: -1, // 过滤关于页面的副本
        },
      },
      include: [
        // 查找 分类
        { model: model.Tag, attributes: ['name'] },
        { model: model.Category, attributes: ['name'] },
      ],
    })

    await Promise.all(list.map(article => generateFile(article)))

    // 打包压缩 ...
    const zipName = 'mdFiles.zip'
    const zipStream = fs.createWriteStream(`${outputPath}/${zipName}`)
    const zip = archiver('zip')
    zip.pipe(zipStream)
    list.forEach((item: any) => {
      zip.append(fs.createReadStream(`${outputPath}/${item.title}.md`), {
        name: `${item.title}.md`, // 压缩文件名
      })
    })
    await zip.finalize()

    ctx.attachment(decodeURI(zipName))
    await send(ctx, zipName, { root: outputPath })
  }
}
