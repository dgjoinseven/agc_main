'use strict';

const Service = require('egg').Service;
const ReturnCode = require('../utils/code');

class MPDService extends Service {
    constructor(ctx) {
        super(ctx);
    }

    //开始排单
    async startPD() {
        const { ctx } = this;
        const zTime = parseInt(Date.now()/1000);
        let zOrderList = await this.app.mysql.get('db1').query(`select * from ctw_order where to_id=-99`);
        let zPdList = await this.app.mysql.get('db1').query(`select * from ctw_order_pd where sum<4`);
        if(zOrderList && zOrderList[0]){
            if(zPdList && zPdList[0]){
                console.log(`===startPD===== 收钱账号个数:${zPdList.length}  付钱账号:${zOrderList.length}`);
                for(let i=0; i<zOrderList.length; i++){
                    let zOrderInfo = zOrderList[i];

                    //匹配总量小于4的收款账号
                    for(let j=0; j<zPdList.length; j++){
                        let zPdInfo = zPdList[j];
                        if(zPdInfo.sum < 4){
                            let zPdSum = zPdInfo.sum + 1;
                            let zPdOrderList = "";
                            if(!zPdInfo.order_list){
                                zPdOrderList = `,${zOrderInfo.id},`;
                            }else{
                                zPdOrderList =  `${zPdInfo.order_list}${zOrderInfo.id},`;
                            }
                            
                            const conn = await this.app.mysql.get('db1').beginTransaction(); // 初始化事务
                            try{
                                //更新 排单表、order表的信息
                                let zUserInfo = await ctx.service.mUser.getUserInfo(zPdInfo.user_id);
                                let zPdUpdate = await conn.query(`update ctw_order_pd set sum=${zPdSum}, order_list='${zPdOrderList}', update_time=${zTime} where id=${zPdInfo.id}`);
                                let zOrderUpdate = await conn.query(`update ctw_order set to_id=${zUserInfo.id}, to_addr='${zUserInfo.wallet_addr}', to_bank='${zUserInfo.bank_addr}', to_alipay='${zUserInfo.alipay_addr}', update_time=${zTime} where id=${zOrderInfo.id}`);
                                if(zPdUpdate && zPdUpdate["affectedRows"]>0 && zOrderUpdate && zOrderUpdate["affectedRows"]>0){
                                    zPdInfo.sum = zPdSum;
                                    zPdInfo.order_list = zPdOrderList;
                                    zPdList[j] = zPdInfo;
                                    await conn.commit(); // 提交事务
                                    console.log(`===startPD===== 更新ctw_order_pd成功 id=${zPdInfo.id}  sum=${zPdSum}  order_list=${zPdOrderList}`);
                                    break;
                                }else{
                                    await conn.rollback(); // 回滚事务！！
                                    ctx.logger.info(`===startPD===== 更新ctw_order_pd失败！！ id=${zPdInfo.id}  sum=${zPdSum}  order_list=${zPdOrderList}`);
                                }
                            }catch (error) {
                                await conn.rollback(); // 一定记得捕获异常后回滚事务！！
                                ctx.logger.error(`===startPD===== 捕获异常，操作失败, err:${error.stack}`);
                            }
                        }
                    }
                }
            }else{
                console.log(`===startPD===== 没有收钱账号  付钱账号:${zOrderList.length}`);
            }
            
        }else{
            console.log("===startPD===== 没有付钱账号");
        }
    }

}
module.exports = MPDService;