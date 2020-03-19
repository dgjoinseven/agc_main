'use strict';

const Controller = require('egg').Controller;
const ReturnCode = require('../utils/code');

class CUserController extends Controller {
    async login() {
        // console.log("==========login");
        const { ctx } = this;
        // const TOTP = this.ctx.helper.totp();
        const zRes = this.ctx.request.body;
        const zAccount = zRes.account;
        const zPwd = zRes.pwd;
        // const code = zRes.code;
        // console.log("ReturnCode===========", ReturnCode[3002]);

        if (typeof (zRes) === 'undefined') {
            this.ctx.body = { code:1017, msg:ReturnCode[1017], data:zRes };
            return;
        }

        // 错误登录5次，5分钟内限制登录
        if (this.ctx.session[zAccount] != undefined) {
            const currentTime = Date.now() / 1000;
            if (this.ctx.session[zAccount].loginErrorCount >= 5 && currentTime - this.ctx.session[zAccount].time >= 300) {
                this.ctx.session[zAccount] = { loginErrorCount: 0, time: Date.now() / 1000 };
            } else if (this.ctx.session[zAccount].loginErrorCount >= 5) {
                this.ctx.body = { code:1004, msg:ReturnCode[1004], data: {} };
                return;
            }
        } else {
            this.ctx.session[zAccount] = { loginErrorCount: 0, time: Date.now() / 1000 };
        }

        //正式判断账号
        const zResult = await ctx.service.mUser.getUserInfoByAccount(zAccount);
        // console.log("zResult=1===========", zResult, zResult[0]);
        if (zResult) {
            let zUserInfo = zResult;
            // const totp = new TOTP(zResult.totpKey);
            // const totpcode = totp.genOTP();
            // if(zUserInfo.is_del==1){
            //     this.ctx.body = { code: 1003, msg:ReturnCode[1003] };
            //     return;
            // }
            if(zUserInfo.is_use==0){
                this.ctx.body = { code: 1012, msg:ReturnCode[1012] };
                return;
            }
            if (ctx.helper.md5(zPwd, zUserInfo.salt) === zUserInfo.pwd) {
                // if (totp.verify(code) === true && code === totpcode) {
                    let zTokenInfo = {
                        id : zUserInfo.id,
                        name : zUserInfo.name,
                        boss_id : zUserInfo.boss_id,
                        boss_id_2 : zUserInfo.boss_id_2,
                        is_special : zUserInfo.is_special,
                        account : zUserInfo.account
                    };
                    const token = ctx.helper.generateToken(zTokenInfo);
                    await this.app.redis.set('login_'+zUserInfo.account, token, 'EX', 60*60*24*7);

                    console.log("set login_account: ", 'login_'+zUserInfo.account, token);
                    // console.log("写token: ", zUserInfo.account, token);

                    let zData = {};
                    zData["token"] = token;
                    zData["conf"] = await this.ctx.helper.getConfigDic();
                    zData["userInfo"] = {
                        "id":zUserInfo.id,
                        "name":zUserInfo.name,
                        "account":zUserInfo.account,
                        "img_id":zUserInfo.img_id,
                        "boss_id":zUserInfo.boss_id,
                        "boss_id_2":zUserInfo.boss_id_2,
                        "boss_list":zUserInfo.boss_list,
                        "is_lv":zUserInfo.is_lv,
                        "pwd2":zUserInfo.pwd2,
                        "status":zUserInfo.status,
                        "rounds":zUserInfo.rounds,
                        "wallet_addr":zUserInfo.wallet_addr,
                        "bank_addr":zUserInfo.bank_addr,
                        "alipay_addr":zUserInfo.alipay_addr,
                        "wallet_type":zUserInfo.wallet_type,
                        "is_special":zUserInfo.is_special,
                        "is_lotto":zUserInfo.is_lotto,
                        "tel":zUserInfo.tel,
                        "remarks":zUserInfo.remarks,
                        "is_out":zUserInfo.is_out,
                        "out_time":zUserInfo.out_time,
                        "jc_sum":zUserInfo.jc_sum,
                        "zt_sum":zUserInfo.zt_sum,
                        "jc_list":zUserInfo.jc_list,
                    };

                    //更新登录时间
                    const zTime = parseInt(Date.now()/1000);
                    let zParamValue = [];
                    zParamValue.push(zTime, zUserInfo.id);
                    await this.app.mysql.get('db1').query(`update ctw_user set login_time=? where id=?`, zParamValue); // 初始化事务
                    
                    this.ctx.body = { code: 1, msg: '登录成功', data:zData };
            } else {
                this.ctx.session[zAccount] = { loginErrorCount: this.ctx.session[zAccount].loginErrorCount + 1, time: Date.now() / 1000 };
                this.ctx.body = { code:1001, msg:ReturnCode[1001] };
            }
        } else {
            this.ctx.body = { code:1002, msg:ReturnCode[1002] };
        }
    }

    async logout() {
        const zRes = this.ctx.request.body;
        if (typeof (zRes) === 'undefined') {
            this.ctx.body = { code:1017, msg:ReturnCode[1017], data:zRes };
            return;
        }
        await this.app.redis.del('login_'+zRes.account);
        this.ctx.body = { code:1, msg:"登出成功" };
    }

    async test() {
    }

}

module.exports = CUserController;
