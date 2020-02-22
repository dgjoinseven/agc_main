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
    
    async sendEmail(param) {
        const email = {
            host: this.app.config.email.host,
            port: this.app.config.email.port,
            secureConnection: true,
            auth: {
                user: this.app.config.email.auth.user,
                pass: this.app.config.email.auth.pwd
            }
        };
        // 创建一个SMTP客户端对象
        const transporter = await nodeMailer.createTransport(email);
        let info = {
            // 发件人
            from: email.auth.user,
            // 主题
            subject: param.title,
            // 收件人
            to: param.email,
            // 邮件内容，HTML格式
            text: param.content//内容
        };
        const result = await transporter.sendMail(info);
        return result;
    }
}
module.exports = MEmailService;