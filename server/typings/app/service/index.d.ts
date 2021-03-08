// This file is created by egg-ts-helper@1.25.8
// Do not modify this file!!!!!!!!!

import 'egg';
type AnyClass = new (...args: any[]) => any;
type AnyFunc<T = any> = (...args: any[]) => T;
type CanExportFunc = AnyFunc<Promise<any>> | AnyFunc<IterableIterator<any>>;
type AutoInstanceType<T, U = T extends CanExportFunc ? T : T extends AnyFunc ? ReturnType<T> : T> = U extends AnyClass ? InstanceType<U> : U;
import ExportArticle from '../../../app/service/Article';
import ExportBaseService from '../../../app/service/BaseService';
import ExportComment from '../../../app/service/Comment';
import ExportDiscuss from '../../../app/service/Discuss';
import ExportFragment from '../../../app/service/Fragment';
import ExportIp from '../../../app/service/Ip';
import ExportRecord from '../../../app/service/Record';
import ExportUser from '../../../app/service/User';

declare module 'egg' {
  interface IService {
    article: AutoInstanceType<typeof ExportArticle>;
    baseService: AutoInstanceType<typeof ExportBaseService>;
    comment: AutoInstanceType<typeof ExportComment>;
    discuss: AutoInstanceType<typeof ExportDiscuss>;
    fragment: AutoInstanceType<typeof ExportFragment>;
    ip: AutoInstanceType<typeof ExportIp>;
    record: AutoInstanceType<typeof ExportRecord>;
    user: AutoInstanceType<typeof ExportUser>;
  }
}
