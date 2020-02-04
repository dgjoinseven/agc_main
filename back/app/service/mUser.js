'use strict';

const Service = require('egg').Service;


class UserService extends Service {
    constructor(ctx) {
        super(ctx);
    }
    async getAdminInfo(param) {
        try {
            // console.log("getAdminInfo 1=====================",param, param.account);
            // console.log("this.app========", this.app);
            const zSql = `select * from ctw_user where account='${param.account}' `;
            const zResult = await this.app.mysql.get('db1').query(zSql);
            
            return zResult;
        } catch (error) {
            throw error;
        }
    }


    //获取用户信息
    async getUserInfo(pId) {
        const zSql = `select * from ctw_user where id='${pId}' `;
        const zResult = await this.app.mysql.get('db1').query(zSql);
        let zUserInfo;
        if(zResult && zResult[0]){
            zUserInfo = zResult[0];
        }
        return zUserInfo;
    }

    //获取公排用户信息
    async getRoundsUserInfo(pId, pRounds) {
        const zSql = `select * from ctw_rounds where user_id=${pId} and rounds=${pRounds} `;
        const zResult = await this.app.mysql.get('db1').query(zSql);
        let zUserInfo;
        if(zResult && zResult[0]){
            zUserInfo = zResult[0];
        }
        return zUserInfo;
    }

}
module.exports = UserService;
