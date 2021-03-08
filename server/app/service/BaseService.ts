import { Service } from 'egg';

export default class BaseService extends Service {
  /**
   * sayHi to you
   * @param name - your name
   */
  public async sayHi(name: string) {
    return `hi, ${name}`;
  }

  public async sendingEmail(articleId, commentList, commentId, userId) {
    const { model, app } = this.ctx;
    const { utils } = app;
    const article = await model.Article.findOne({ where: { id: articleId }, attributes: ['id', 'title'] })
    const target = commentList.rows.find(d => d.id === parseInt(commentId))

    const { emailList, html } = utils.email.getEmailData(article, target, userId)
    Promise.all(emailList.map(receiver => utils.email.sendEmail({ receiver, html })))
      .then(res => {
        console.log('success to send email')
      })
      .catch(e => {
        console.log('fail to send email', JSON.stringify(e))
      })
  }
}
