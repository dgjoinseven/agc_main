'use strict';

const fs = require('fs');
const path = require('path');
const moment = require('moment');
const Service = require('egg').Service;
const ReturnCode = require('../utils/code');
const pump= require('mz-modules/pump');


class MUploadFileService extends Service {
    constructor(ctx) {
        super(ctx);
    }

    async uploadImg() {
        const { ctx } = this;
        let parts = ctx.multipart();
        let stream = []; // 图片访问地址集合
        let zRead_img_url;
        const zTime = Date.now();
        const zDay = moment(zTime).format('YYYYMMDD');
        let loop = 0;
        let zToken;
        let zNickName;
        let zOrderId;

        let zConfigDic = await this.ctx.helper.getConfigDic();
        let zUploadImgMax = parseInt(zConfigDic["upload_img_max"]); //最大上传图片次数

        while ((stream = await parts()) != null) {
            // loop ++;
            // console.log("parts----"+loop+"-----------");
            // console.log(stream);
            
            if(!stream.filename){
                ///////////////// 获取数据 ///////////////////
                let zKey = stream[0];
                let zValue = stream[1];
                switch(zKey){
                    case 'token':
                        zToken = zValue;
                        break;
                    case 'nickname':
                        zNickName = zValue;
                        break;
                    case 'orderid':
                        zOrderId = parseInt(zValue);
                        break;
                }
            }else{
                ///////////////// 获取图片 ///////////////////
                console.log("存储图片 ///////////////////", zNickName, zOrderId);

                //判断token
                let zAuthToken = zToken; // 获取header里的authorization
                if (zAuthToken) {
                    try {
                        const zTokenInfo = ctx.helper.verifyToken(zAuthToken);// 解密获取的Token
                        if (zTokenInfo && zTokenInfo.account) {
                            let zRedisToken = await ctx.app.redis.get('login_'+zTokenInfo.account);
                            if(zAuthToken != zRedisToken){
                                return { code: 10001, msg: 'token失效，请登陆后再进行操作' };
                            }
                        } else {
                            return { code: 10001, msg: '请登陆后再进行操作' };
                        }
                    }catch (error) {
                        ctx.logger.warn(error)
                        return { code: 10001, msg: '请求文件头authorization解析错误', error:error };
                    }
                } else {
                    ctx.body = { code: 10001, msg: '缺乏请求文件头authorization' };
                }

                //判断图片尺寸(500k)
                if(stream._readableState.length>500000){
                    return {code:1030, msg:'image too big'};
                }
                
                //判断文件类型
                const zExtName = path.extname(stream.filename).toLocaleLowerCase();
                if(zExtName!=".jpg" && zExtName!=".jpeg" && zExtName!=".png"){
                    return {code:1031, msg:`wrong file  zExtName=${zExtName}`};
                }

                //判断上传次数
                const zOrderList = await this.app.mysql.get('db1').query(`select * from ctw_order where id=${zOrderId}`);
                if(zOrderList && zOrderList[0]){
                    if(zOrderList[0].img_url && zOrderList[0].img_sum>=zUploadImgMax){
                        return {code:1032, msg:`img_url is existence  img_url:${zOrderList[0].img_url}  img_sum=${zOrderList[0].img_sum}`};
                    }
                }else{
                    return {code:-1, msg:`wrong order id ${zOrderId}`};
                }

                //判断并且创建文件夹，创建文件
                let zBaseDir = this.ctx.app.baseDir;
                let zDir_org = path.join(zBaseDir, "./uploadimg/");
                let zDir_day = path.join(zBaseDir, "./uploadimg/", zDay);
                if (!fs.existsSync(zDir_org)) {
                    fs.mkdirSync(zDir_org);
                }
                if(!fs.existsSync(zDir_day)){
                    fs.mkdirSync(zDir_day);
                }
                // 文件命名
                const zYMDHMS = moment(zTime).format('YYYYMMDD-HHmmss');
                let zFilename = `${zYMDHMS}-${zNickName}-${zOrderId}${zExtName}`;
                // 上传图片的目录
                let zWrite_img_url = path.join(zBaseDir, "./uploadimg/", zDay, zFilename);
                zRead_img_url = `${this.ctx.app.config.img_url}/${zDay}/${zFilename}`;
                let writeStream = fs.createWriteStream(zWrite_img_url);
                await pump(stream, writeStream);
                
                //往订单列表里写入图片地址
                let zUpdateTime = parseInt(zTime/1000);
                await this.app.mysql.get('db1').query(`update ctw_order set img_url='${zRead_img_url}', img_sum=img_sum+1, update_time=${zUpdateTime} where id=${zOrderId}`);
            }
        }
        // console.log(parts.field) // 表单其他数据，可以根据需要处理
        return {code:1, msg:'success', data:{url:zRead_img_url, fields:parts.field}};
    }

}
module.exports = MUploadFileService;