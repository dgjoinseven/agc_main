'use strict';

const fs = require('fs');
const path = require('path');
const moment = require('moment');
const Service = require('egg').Service;
const ReturnCode = require('../utils/code');
const pump= require('mz-modules/pump');
const nodeMailer = require('nodemailer');

class MEmailService extends Service {
    constructor(ctx) {
        super(ctx);
    }
    
    //发送验证码
    async smsCode(pParam) {
        let zTel = pParam.tel;
        if(!zTel){
            return {code:-1, msg:"电话号码不能为空"};
        }
        let zHaveCode = await this.ctx.app.redis.get('code_'+zTel);
        if(zHaveCode){
            return {code:3006, msg:"获取验证码太频繁"};
        }
        let zCode = Math.random().toString(10).substr(2, 4);
        await this.ctx.app.redis.set('code_'+zTel, zCode, 'EX', 60);
        let zContent = `短信验证码：${zCode}`;
        const result = await this.ctx.service.mzEmailTel.sendSms(zTel, zContent);
        if(result.status==200){
            return {code:1, msg:"发送验证码成功"};
        }else{
            return {code:-1, msg:"发送验证码失败"};
        }
        
    }

    //忘记密码
    //@account
    async forgetPwd(pParam) {
        const { ctx } = this;
        let zAccount = pParam.account;
        if(!zAccount){
            return {code:3002, msg:"账号不能为空"};
        }
        let zUserInfo = await ctx.service.mUser.getUserInfoByAccount(zAccount);
        let zTel = zUserInfo.tel;
        console.log(zTel);
        if(!zTel){
            return {code:3004, msg:"电话号码不能为空"};
        }

        const zTime = parseInt(Date.now()/1000);
        const zConf = await ctx.helper.getConfigDic();
        const zConfForgetPwdTime = parseInt(zConf["forget_pwd_time"])*3600;
        const zForgetPwdTime = parseInt(zUserInfo.forgetpwd_time);
        const zTotalTime = zForgetPwdTime+zConfForgetPwdTime;
        if(zTotalTime > zTime){
            return {code:3008, msg:"找回密码太频繁，请歇息一下"};
        }

        let zSalt = ctx.helper.generateSalt();
        let zPwdOrg = Math.random().toString(10).substr(2, 6);
        let zPwd = ctx.helper.md5(zPwdOrg, zSalt);
        let zParam = ``;
        let zParamValue = [];
        zParam += ` pwd=? ,`;  zParamValue.push(zPwd);
        zParam += ` salt=? ,`;  zParamValue.push(zSalt);
        zParam += ` forgetpwd_time=? ,`;  zParamValue.push(zTime);
        zParam += ` update_time=? `;  zParamValue.push(zTime);
        zParamValue.push(zUserInfo.id);
        let zSql = `update ctw_user set ${zParam} where id=?`;
        let zSetPwdResult = await this.app.mysql.get('db1').query(zSql, zParamValue);
        if(zSetPwdResult && zSetPwdResult["affectedRows"]>0){
            let zContent = `${zUserInfo.name} 重新设置密码：${zPwdOrg}`;
            const result = await this.ctx.service.mzEmailTel.sendSms(zTel, zContent);
            if(result.status==200){
                return {code:1, msg:"找回密码成功"};
            }else{
                return {code:-1, msg:"找回密码失败"};
            }
        }else{
            return {code:-1, msg:"找回密码失败"};
        }
    }

    //发送短信
    async sendSms(pTel, pContent) {
        let zUrl = 'http://m.5c.com.cn/api/send/index.php';
        const zOptions = {
            method: 'POST',
            dataType: 'text',
            timeout: '100000',
            data: {
                type: 'send',
                encode : 'UTF-8',
                username: 'zhoucw',					//用户账号
                password: 'qwer1234',				//密码
                apikey: '634d5d553276b9397ee40cd2b38e7eba',		//apikey
                mobile: pTel,					    //号码
                content: '【AGC】' + pContent,		//内容
             }
        };
        const result = await this.ctx.curl(zUrl, zOptions);
        return result;
    }
}
module.exports = MEmailService;