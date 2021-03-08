// This file is created by egg-ts-helper@1.25.8
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportArticle from '../../../app/model/article';
import ExportCategory from '../../../app/model/category';
import ExportComment from '../../../app/model/comment';
import ExportFragment from '../../../app/model/fragment';
import ExportIp from '../../../app/model/ip';
import ExportRecord from '../../../app/model/record';
import ExportReply from '../../../app/model/reply';
import ExportTag from '../../../app/model/tag';
import ExportUser from '../../../app/model/user';

declare module 'egg' {
  interface IModel {
    Article: ReturnType<typeof ExportArticle>;
    Category: ReturnType<typeof ExportCategory>;
    Comment: ReturnType<typeof ExportComment>;
    Fragment: ReturnType<typeof ExportFragment>;
    Ip: ReturnType<typeof ExportIp>;
    Record: ReturnType<typeof ExportRecord>;
    Reply: ReturnType<typeof ExportReply>;
    Tag: ReturnType<typeof ExportTag>;
    User: ReturnType<typeof ExportUser>;
  }
}
