import { Application } from 'egg';

/**
 * 路由
 * @param {Egg.Application} app - 当前应用的实例
 * @author yutiy
 */
export default (app: Application) => {
  const { controller, router } = app;
  const { baseController, article, user, fragment, tag, record, discuss } = controller;

  // 挂载鉴权路由
  app.passport.mount('github');
  router.get('/', baseController.index);

  /**
   * article
   */
  router.get('/initAbout', article.initAboutPage);
  router.post('/article', article.create);
  router.get('/article/list', article.getList);
  router.get('/article/:id', article.findById); // 获取文章
  router.put('/article/:id', article.update) // 修改文章
  router.delete('/article/:id', article.delete) // 删除指定文章
  router.delete('/article/list/:list', article.delList) // 删除指定文章列表
  router.post('/article/upload', article.upload) // 上传文章
  router.post('/article/checkExist', article.checkExist) // 确认文章是否存在
  router.post('/article/upload/confirm', article.uploadConfirm) // 确认上传的文章 读取 upload 文件文章 插入数据库
  router.get('/article/md/:id', article.output) // 导出指定文章
  router.get('/article/output/all', article.outputAll) // 导出所有文章
  router.get('/article/output/:id', article.output) // 导出文章
  router.get('/article/output/list/:list', article.outputList) // 导出指定文章

  /**
   * user
   */
  router.get('/initGithub', user.initGithubUser);
  router.post('/login', user.login); // 登录
  router.get('/login', user.login);
  router.post('/register', user.register); // 注册
  router.get('/user/list', user.getList); // 获取列表
  router.get('/user/find/:username', user.findUser); // 根据用户名查找用户
  router.put('/user/:userId', user.updateUser); // 更新用户信息
  router.delete('/user/:userId', user.delete); // 删除用户

  /**
   * discuss
   */
  router.post('/discuss', discuss.create) // 创建评论或者回复 articleId 文章 id
  router.delete('/discuss/comment/:commentId', discuss.deleteComment) // 删除一级评论
  router.delete('/discuss/reply/:replyId', discuss.deleteReply) // 删除回复

  /**
   * tag
   */
  router.get('/tag/list', tag.getTagList); // 获取所有的 tag 列表
  router.get('/category/list', tag.getCategoryList); // 获取 category 列表

  /**
   * record
   */
  router.get('/record', record.fetchRecordByDay);

  /**
   * fragment
   */
  router.get('/fragment', fragment.list);
  router.post('/fragment/create', fragment.create);
};
