// This file is created by egg-ts-helper@1.25.8
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportBaseController from '../../../app/controller/BaseController';
import ExportArticle from '../../../app/controller/article';
import ExportDiscuss from '../../../app/controller/discuss';
import ExportFragment from '../../../app/controller/fragment';
import ExportRecord from '../../../app/controller/record';
import ExportTag from '../../../app/controller/tag';
import ExportUser from '../../../app/controller/user';

declare module 'egg' {
  interface IController {
    baseController: ExportBaseController;
    article: ExportArticle;
    discuss: ExportDiscuss;
    fragment: ExportFragment;
    record: ExportRecord;
    tag: ExportTag;
    user: ExportUser;
  }
}
