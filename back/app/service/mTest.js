'use strict';

const Service = require('egg').Service;
const ReturnCode = require('../utils/code');

class MTestService extends Service {
    constructor(ctx) {
        super(ctx);
    }

    //创建用户
    async createUser(pParam) {
        const { ctx } = this;
        let zType = (pParam.type!=undefined)?parseInt(pParam.type):1;
        const zTime = parseInt(Date.now()/1000);
        let zList = [];
        switch(zType){
            case 1://创建初始人物
                zList.push({"id":1, "name":"Omiga", "account":"o1", "wallet_addr":"0x1B312CBc2b3b9F81aC44808e20aA65ada547d327", "pwd":"111111", "pwd2":"111111", "boss_id":0, "boss_id_2":0, "boss_list":"", "status":1, "rounds":20, "is_special":1});
                zList.push({"id":2, "name":"gOOgle", "account":"o2", "wallet_addr":"0x506d88773f9664cF541649EAca5F0b0054c40cb7", "pwd":"111111", "pwd2":"111111", "boss_id":0, "boss_id_2":0, "boss_list":"", "status":1, "rounds":20, "is_special":1});
                zList.push({"id":3, "name":"dOtheBest", "account":"o3", "wallet_addr":"0x632F11c08c884A2a80d20d4A79446319dE1eFb06", "pwd":"111111", "pwd2":"111111", "boss_id":0, "boss_id_2":0, "boss_list":"", "status":1, "rounds":20, "is_special":1});
                zList.push({"id":4, "name":"wOw", "account":"o4", "wallet_addr":"0x7993D2c31E2658CAe21D897DAa48521E13AC7316", "pwd":"111111", "pwd2":"111111", "boss_id":0, "boss_id_2":0, "boss_list":"", "status":1, "rounds":20, "is_special":1});
                zList.push({"id":5, "name":"fuckTheOrder", "account":"o5", "wallet_addr":"0x00f337147B51DA64a6c6332aa2b2320d9D32d095", "pwd":"111111", "pwd2":"111111", "boss_id":0, "boss_id_2":0, "boss_list":"", "status":1, "rounds":20, "is_special":1});
                zList.push({"id":6, "name":"DOWORK", "account":"o6", "wallet_addr":"0xa4F7eE1496fBdad882A1F73287Eb0FCB566B4914", "pwd":"111111", "pwd2":"111111", "boss_id":0, "boss_id_2":0, "boss_list":"", "status":1, "rounds":20, "is_special":1});
                zList.push({"id":7, "name":"GOODboy", "account":"o7", "wallet_addr":"0xEe95108F6C1a294fd186B96B6A42E88aFF5d2C55", "pwd":"111111", "pwd2":"111111", "boss_id":0, "boss_id_2":0, "boss_list":"", "status":1, "rounds":20, "is_special":1});
                zList.push({"id":8, "name":"bannarBOAT", "account":"o8", "wallet_addr":"0xfe56E6367d94760DBaFfFAea4F0B8fbA4d4f1647", "pwd":"111111", "pwd2":"111111", "boss_id":0, "boss_id_2":0, "boss_list":"", "status":1, "rounds":20, "is_special":1});
                zList.push({"id":9, "name":"ZOIEW", "account":"o9", "wallet_addr":"0x353816eeF1E9f3bD812a3b4d78D110d05F67fEd3", "pwd":"111111", "pwd2":"111111", "boss_id":0, "boss_id_2":0, "boss_list":"", "status":1, "rounds":20, "is_special":1});
                break;
            case 2://创建测试人物
                zList.push({"id":10, "name":"O", "account":"o", "wallet_addr":"0x53a26b50288a48518b2bb20375d254c35d38bf94", "pwd":"111111", "pwd2":"111111", "boss_id":1, "boss_id_2":2, "boss_list":",1,2,", "status":0, "rounds":0, "is_special":0});
                zList.push({"id":11, "name":"A", "account":"a", "wallet_addr":"0x53a26b50288a48518b2bb20375d254c35d38bf94", "pwd":"111111", "pwd2":"111111", "boss_id":10, "boss_id_2":1, "boss_list":",10,1,", "status":0, "rounds":0, "is_special":0});
                zList.push({"id":12, "name":"B", "account":"b", "wallet_addr":"0x53a26b50288a48518b2bb20375d254c35d38bf94", "pwd":"111111", "pwd2":"111111", "boss_id":10, "boss_id_2":1, "boss_list":",10,1,", "status":0, "rounds":0, "is_special":0});
                zList.push({"id":13, "name":"C", "account":"c", "wallet_addr":"0x53a26b50288a48518b2bb20375d254c35d38bf94", "pwd":"111111", "pwd2":"111111", "boss_id":10, "boss_id_2":1, "boss_list":",10,1,", "status":0, "rounds":0, "is_special":0});
                zList.push({"id":14, "name":"A1", "account":"a1", "wallet_addr":"0x53a26b50288a48518b2bb20375d254c35d38bf94", "pwd":"111111", "pwd2":"111111", "boss_id":11, "boss_id_2":10, "boss_list":",11,10,", "status":0, "rounds":0, "is_special":0});
                zList.push({"id":15, "name":"A2", "account":"a2", "wallet_addr":"0x53a26b50288a48518b2bb20375d254c35d38bf94", "pwd":"111111", "pwd2":"111111", "boss_id":11, "boss_id_2":10, "boss_list":",11,10,", "status":0, "rounds":0, "is_special":0});
                zList.push({"id":16, "name":"A3", "account":"a3", "wallet_addr":"0x53a26b50288a48518b2bb20375d254c35d38bf94", "pwd":"111111", "pwd2":"111111", "boss_id":11, "boss_id_2":10, "boss_list":",11,10,", "status":0, "rounds":0, "is_special":0});
                zList.push({"id":17, "name":"B1", "account":"b1", "wallet_addr":"0x53a26b50288a48518b2bb20375d254c35d38bf94", "pwd":"111111", "pwd2":"111111", "boss_id":12, "boss_id_2":10, "boss_list":",12,10,", "status":0, "rounds":0, "is_special":0});
                zList.push({"id":18, "name":"B2", "account":"b2", "wallet_addr":"0x53a26b50288a48518b2bb20375d254c35d38bf94", "pwd":"111111", "pwd2":"111111", "boss_id":12, "boss_id_2":10, "boss_list":",12,10,", "status":0, "rounds":0, "is_special":0});
                zList.push({"id":19, "name":"B3", "account":"b3", "wallet_addr":"0x53a26b50288a48518b2bb20375d254c35d38bf94", "pwd":"111111", "pwd2":"111111", "boss_id":12, "boss_id_2":10, "boss_list":",12,10,", "status":0, "rounds":0, "is_special":0});
                zList.push({"id":20, "name":"C1", "account":"c1", "wallet_addr":"0x53a26b50288a48518b2bb20375d254c35d38bf94", "pwd":"111111", "pwd2":"111111", "boss_id":13, "boss_id_2":10, "boss_list":",13,10,", "status":0, "rounds":0, "is_special":0});
                zList.push({"id":21, "name":"C2", "account":"c2", "wallet_addr":"0x53a26b50288a48518b2bb20375d254c35d38bf94", "pwd":"111111", "pwd2":"111111", "boss_id":13, "boss_id_2":10, "boss_list":",13,10,", "status":0, "rounds":0, "is_special":0});
                zList.push({"id":22, "name":"C3", "account":"c3", "wallet_addr":"0x53a26b50288a48518b2bb20375d254c35d38bf94", "pwd":"111111", "pwd2":"111111", "boss_id":13, "boss_id_2":10, "boss_list":",13,10,", "status":0, "rounds":0, "is_special":0});
                break;
            case 3://创建运营团队正式人物
                // zList.push({"name":"Terry", "account":"251333738@qq.com", "wallet_addr":"0x53a26b50288a48518b2bb20375d254c35d38bf94", "pwd":"111111", "pwd2":"111111", "boss_id":1, "boss_id_2":2, "boss_list":",1,2,", "status":0, "rounds":0, "is_special":0});
                // zList.push({"name":"Frank", "account":"angelcityno1@163.com", "wallet_addr":"0x47b7A5C94862A08258Ede2D594E2489A7796A3D2", "pwd":"111111", "pwd2":"111111", "boss_id":0, "boss_id_2":0, "boss_list":"", "status":0, "rounds":0, "is_special":0});
                break;
        }
        for(let i=0; i<zList.length; i++){
            var zInfo = zList[i];
            var zSalt = ctx.helper.generateSalt();
            var zPwd = ctx.helper.md5(zInfo.pwd, zSalt);
            var zPwd2 = ctx.helper.md5(zInfo.pwd2, zSalt);
            var zImgId = parseInt(Math.random()*20);
            let zParam = ` '${zInfo.name}', '${zInfo.account}', '${zInfo.wallet_addr}', '${zPwd}', '${zSalt}', '${zPwd2}', '${zSalt}', ${zImgId}, ${zInfo.boss_id}, ${zInfo.boss_id_2}, '${zInfo.boss_list}', ${zInfo.status}, ${zInfo.rounds}, ${zInfo.is_special}, ${zTime} `;
            let zSql = `insert into ctw_user (name, account, wallet_addr, pwd, salt, pwd2, salt2, img_id, boss_id, boss_id_2, boss_list, status, rounds, is_special, create_time) values (`+zParam+`)`;
            if(zInfo.id!=undefined){
                zParam = ` ${zInfo.id}, '${zInfo.name}', '${zInfo.account}', '${zInfo.wallet_addr}', '${zPwd}', '${zSalt}', '${zPwd2}', '${zSalt}', ${zImgId}, ${zInfo.boss_id}, ${zInfo.boss_id_2}, '${zInfo.boss_list}', ${zInfo.status}, ${zInfo.rounds}, ${zInfo.is_special}, ${zTime} `;
                zSql = `insert into ctw_user (id, name, account, wallet_addr, pwd, salt, pwd2, salt2, img_id, boss_id, boss_id_2, boss_list, status, rounds, is_special, create_time) values (`+zParam+`)`;
            }
            await this.app.mysql.get('db1').query(zSql);
        }
        return {code:1, msg:"success"};
    }

    //创建公排用户
    async createRound(pParam) {
        const { ctx } = this;
        let zType = (pParam.type!=undefined)?parseInt(pParam.type):1;
        const zTime = parseInt(Date.now()/1000);
        let zList = [];
        switch(zType){
            case 1://创建初始人物
                zList.push({"user_id":1, "rounds":1, "zt_sum":2, "boss_1_id":0, "boss_2_id":0, "is_send_dyn":1});
                zList.push({"user_id":2, "rounds":1, "zt_sum":0, "boss_1_id":1, "boss_2_id":0, "is_send_dyn":1});
                zList.push({"user_id":3, "rounds":1, "zt_sum":0, "boss_1_id":1, "boss_2_id":0, "is_send_dyn":1});
                zList.push({"user_id":4, "rounds":2, "zt_sum":2, "boss_1_id":0, "boss_2_id":0, "is_send_dyn":1});
                zList.push({"user_id":5, "rounds":2, "zt_sum":0, "boss_1_id":4, "boss_2_id":0, "is_send_dyn":1});
                zList.push({"user_id":6, "rounds":2, "zt_sum":0, "boss_1_id":4, "boss_2_id":0, "is_send_dyn":1});
                zList.push({"user_id":7, "rounds":3, "zt_sum":2, "boss_1_id":0, "boss_2_id":0, "is_send_dyn":1});
                zList.push({"user_id":8, "rounds":3, "zt_sum":0, "boss_1_id":7, "boss_2_id":0, "is_send_dyn":1});
                zList.push({"user_id":9, "rounds":3, "zt_sum":0, "boss_1_id":7, "boss_2_id":0, "is_send_dyn":1});
                zList.push({"user_id":1, "rounds":4, "zt_sum":2, "boss_1_id":0, "boss_2_id":0, "is_send_dyn":1});
                zList.push({"user_id":3, "rounds":4, "zt_sum":0, "boss_1_id":1, "boss_2_id":0, "is_send_dyn":1});
                zList.push({"user_id":5, "rounds":4, "zt_sum":0, "boss_1_id":1, "boss_2_id":0, "is_send_dyn":1});
                zList.push({"user_id":7, "rounds":5, "zt_sum":2, "boss_1_id":0, "boss_2_id":0, "is_send_dyn":1});
                zList.push({"user_id":9, "rounds":5, "zt_sum":0, "boss_1_id":7, "boss_2_id":0, "is_send_dyn":1});
                zList.push({"user_id":2, "rounds":5, "zt_sum":0, "boss_1_id":7, "boss_2_id":0, "is_send_dyn":1});
                zList.push({"user_id":4, "rounds":6, "zt_sum":2, "boss_1_id":0, "boss_2_id":0, "is_send_dyn":1});
                zList.push({"user_id":6, "rounds":6, "zt_sum":0, "boss_1_id":4, "boss_2_id":0, "is_send_dyn":1});
                zList.push({"user_id":8, "rounds":6, "zt_sum":0, "boss_1_id":4, "boss_2_id":0, "is_send_dyn":1});
                zList.push({"user_id":3, "rounds":7, "zt_sum":2, "boss_1_id":0, "boss_2_id":0, "is_send_dyn":1});
                zList.push({"user_id":5, "rounds":7, "zt_sum":0, "boss_1_id":3, "boss_2_id":0, "is_send_dyn":1});
                zList.push({"user_id":7, "rounds":7, "zt_sum":0, "boss_1_id":3, "boss_2_id":0, "is_send_dyn":1});
                zList.push({"user_id":2, "rounds":8, "zt_sum":2, "boss_1_id":0, "boss_2_id":0, "is_send_dyn":1});
                zList.push({"user_id":4, "rounds":8, "zt_sum":0, "boss_1_id":2, "boss_2_id":0, "is_send_dyn":1});
                zList.push({"user_id":6, "rounds":8, "zt_sum":0, "boss_1_id":2, "boss_2_id":0, "is_send_dyn":1});
                zList.push({"user_id":1, "rounds":9, "zt_sum":2, "boss_1_id":0, "boss_2_id":0, "is_send_dyn":1});
                zList.push({"user_id":3, "rounds":9, "zt_sum":0, "boss_1_id":1, "boss_2_id":0, "is_send_dyn":1});
                zList.push({"user_id":5, "rounds":9, "zt_sum":0, "boss_1_id":1, "boss_2_id":0, "is_send_dyn":1});
                zList.push({"user_id":9, "rounds":10, "zt_sum":2, "boss_1_id":0, "boss_2_id":0, "is_send_dyn":1});
                zList.push({"user_id":2, "rounds":10, "zt_sum":0, "boss_1_id":9, "boss_2_id":0, "is_send_dyn":1});
                zList.push({"user_id":3, "rounds":10, "zt_sum":0, "boss_1_id":9, "boss_2_id":0, "is_send_dyn":1});
                zList.push({"user_id":3, "rounds":11, "zt_sum":2, "boss_1_id":0, "boss_2_id":0, "is_send_dyn":1});
                zList.push({"user_id":6, "rounds":11, "zt_sum":0, "boss_1_id":3, "boss_2_id":0, "is_send_dyn":1});
                zList.push({"user_id":7, "rounds":11, "zt_sum":0, "boss_1_id":3, "boss_2_id":0, "is_send_dyn":1});
                zList.push({"user_id":3, "rounds":12, "zt_sum":2, "boss_1_id":0, "boss_2_id":0, "is_send_dyn":1});
                zList.push({"user_id":6, "rounds":12, "zt_sum":0, "boss_1_id":3, "boss_2_id":0, "is_send_dyn":1});
                zList.push({"user_id":7, "rounds":12, "zt_sum":0, "boss_1_id":3, "boss_2_id":0, "is_send_dyn":1});
                zList.push({"user_id":8, "rounds":13, "zt_sum":2, "boss_1_id":0, "boss_2_id":0, "is_send_dyn":1});
                zList.push({"user_id":1, "rounds":13, "zt_sum":0, "boss_1_id":8, "boss_2_id":0, "is_send_dyn":1});
                zList.push({"user_id":7, "rounds":13, "zt_sum":0, "boss_1_id":8, "boss_2_id":0, "is_send_dyn":1});
                zList.push({"user_id":3, "rounds":14, "zt_sum":2, "boss_1_id":0, "boss_2_id":0, "is_send_dyn":1});
                zList.push({"user_id":5, "rounds":14, "zt_sum":0, "boss_1_id":3, "boss_2_id":0, "is_send_dyn":1});
                zList.push({"user_id":2, "rounds":14, "zt_sum":0, "boss_1_id":3, "boss_2_id":0, "is_send_dyn":1});
                zList.push({"user_id":9, "rounds":15, "zt_sum":2, "boss_1_id":0, "boss_2_id":0, "is_send_dyn":1});
                zList.push({"user_id":6, "rounds":15, "zt_sum":0, "boss_1_id":9, "boss_2_id":0, "is_send_dyn":1});
                zList.push({"user_id":3, "rounds":15, "zt_sum":0, "boss_1_id":9, "boss_2_id":0, "is_send_dyn":1});
                zList.push({"user_id":1, "rounds":16, "zt_sum":2, "boss_1_id":0, "boss_2_id":0, "is_send_dyn":1});
                zList.push({"user_id":8, "rounds":16, "zt_sum":0, "boss_1_id":1, "boss_2_id":0, "is_send_dyn":1});
                zList.push({"user_id":4, "rounds":16, "zt_sum":0, "boss_1_id":1, "boss_2_id":0, "is_send_dyn":1});
                zList.push({"user_id":5, "rounds":17, "zt_sum":2, "boss_1_id":0, "boss_2_id":0, "is_send_dyn":1});
                zList.push({"user_id":9, "rounds":17, "zt_sum":0, "boss_1_id":5, "boss_2_id":0, "is_send_dyn":1});
                zList.push({"user_id":7, "rounds":17, "zt_sum":0, "boss_1_id":5, "boss_2_id":0, "is_send_dyn":1});
                zList.push({"user_id":1, "rounds":18, "zt_sum":2, "boss_1_id":0, "boss_2_id":0, "is_send_dyn":1});
                zList.push({"user_id":2, "rounds":18, "zt_sum":0, "boss_1_id":1, "boss_2_id":0, "is_send_dyn":1});
                zList.push({"user_id":3, "rounds":18, "zt_sum":0, "boss_1_id":1, "boss_2_id":0, "is_send_dyn":1});
                zList.push({"user_id":3, "rounds":19, "zt_sum":2, "boss_1_id":0, "boss_2_id":0, "is_send_dyn":1});
                zList.push({"user_id":6, "rounds":19, "zt_sum":0, "boss_1_id":3, "boss_2_id":0, "is_send_dyn":1});
                zList.push({"user_id":7, "rounds":19, "zt_sum":0, "boss_1_id":3, "boss_2_id":0, "is_send_dyn":1});
                zList.push({"user_id":3, "rounds":20, "zt_sum":2, "boss_1_id":0, "boss_2_id":0, "is_send_dyn":1});
                zList.push({"user_id":6, "rounds":20, "zt_sum":0, "boss_1_id":3, "boss_2_id":0, "is_send_dyn":1});
                zList.push({"user_id":7, "rounds":20, "zt_sum":0, "boss_1_id":3, "boss_2_id":0, "is_send_dyn":1});
                break;
        }
        for(let i=0; i<zList.length; i++){
            var zInfo = zList[i];
            let zParam = ` ${zInfo.user_id}, ${zInfo.rounds}, ${zInfo.zt_sum}, ${zInfo.boss_1_id}, ${zInfo.boss_2_id}, ${zInfo.is_send_dyn}, ${zTime}, ${zTime} `;
            let zSql = `insert into ctw_rounds (user_id, rounds, zt_sum, boss_1_id, boss_2_id, is_send_dyn, create_time, update_time) values (`+zParam+`)`;
            await this.app.mysql.get('db1').query(zSql);
        }
        return {code:1, msg:"success"};
    }

    //创建订单
    async createOrder(pParam) {
        const { ctx } = this;
        let zType = (pParam.type!=undefined)?parseInt(pParam.type):1;
        const zTime = parseInt(Date.now()/1000);
        let zList = [];
        switch(zType){
            case 1:
                zList.push({"order_type":2, "from_id":1, "from_addr":"0xaaaaaaaa", "to_id":2, "to_addr":"0xaaaaaaaa", "money":100, "status":0, "rounds":0});
                break;
        }
        for(let i=0; i<zList.length; i++){
            var zInfo = zList[i];
            let zParam = ` ${zInfo.order_type}, ${zInfo.from_id}, '${zInfo.from_addr}', ${zInfo.to_id}, '${zInfo.to_addr}', ${zInfo.money}, ${zInfo.status}, ${zInfo.rounds}, ${zTime} `;
            let zSql = `insert into ctw_order (order_type, from_id, from_addr, to_id, to_addr, money, status, rounds, create_time) values (`+zParam+`)`;
            await this.app.mysql.get('db1').query(zSql);
        }
        return {code:1, msg:"success"};
    }

}
module.exports = MTestService;