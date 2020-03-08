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

    async getUserInfoByName(pName) {
        try {
            const zSql = `select * from ctw_user where name='?' `;
            const zResult = await this.app.mysql.get('db1').query(zSql, [pName]);
            return zResult;
        } catch (error) {
            throw error;
        }
    }


    //获取用户信息
    async getUserInfo(pId) {
        let zDataStr = await this.app.redis.get(`get_user_${pId}`);
        if(!zDataStr){
            const zResult = await this.app.mysql.get('db1').query(`select * from ctw_user where id='${pId}' `);
            let zUserInfo;
            if(zResult && zResult[0]){
                zUserInfo = zResult[0];
                zDataStr = JSON.stringify(zUserInfo);
                await this.app.redis.set(`get_user_${pId}`, zDataStr, 'EX', 1);
            }
        }
        return JSON.parse(zDataStr);
    }

    //清除用户信息缓存
    async delUserInfo(pId) {
        await this.app.redis.del(`get_user_${pId}`);
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
