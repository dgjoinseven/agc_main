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
        let zPdList = await this.app.mysql.get('db1').query(`select * from ctw_order_pd where sum<4 and is_special=0 order by id`);
        let zConfigDic = await this.ctx.helper.getConfigDic();
        const zNowTime = parseInt(Date.now()/1000);
        let zConfPdTime = parseInt(zConfigDic.pd_time)*3600;
        let zPdTime = zNowTime - zConfPdTime;

        if(zOrderList && zOrderList[0]){
            if(zPdList && zPdList[0]){
                console.log(`===startPD===== 收钱账号个数:${zPdList.length}  付钱账号:${zOrderList.length}`);
                for(let i=0; i<zOrderList.length; i++){
                    let zOrderInfo = zOrderList[i];
                    let zPdList = await this.app.mysql.get('db1').query(`select * from ctw_order_pd where sum<4 and is_special=0 and create_time<${zPdTime} order by id`);
                    if(!zPdList || !zPdList[0]){
                        let zRmbUserList = zConfigDic["rmb_user_list"].split(",");
                        let zGetMoneyUserId = zRmbUserList[parseInt(Math.random()*9)];
                        zPdList = await this.app.mysql.get('db1').query(`select * from ctw_order_pd where is_special=1 and user_id=${zGetMoneyUserId}`);
                    }

                    //匹配总量小于4的收款账号
                    // for(let j=0; j<zPdList.length; j++){
                        let zPdInfo = zPdList[0];
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
                                let zPdUpdate = await conn.query(`update ctw_order_pd set sum=${zPdSum}, order_list='${zPdOrderList}', update_time=${zTime} where id=${zPdInfo.id}`);
                                let zOrderUpdate = await conn.query(`update ctw_order set to_id=${zPdInfo.user_id}, update_time=${zTime} where id=${zOrderInfo.id}`);
                                if(zPdUpdate && zPdUpdate["affectedRows"]>0 && zOrderUpdate && zOrderUpdate["affectedRows"]>0){
                                    // zPdInfo.sum = zPdSum;
                                    // zPdInfo.order_list = zPdOrderList;
                                    // zPdList[j] = zPdInfo;
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
                    // }
                }
            }else{
                console.log(`===startPD===== 没有收钱账号  付钱账号:${zOrderList.length}`);
            }
        }else{
            console.log("===startPD===== 没有付钱账号");
        }
    }

    //重更新排单
    //@pPayType  1付钱超时收钱的重置  2收钱确认超时付钱的重置
    async resetPD(pFrozenUserId, pResetUserId, pOrderId, pPayType) {
        const { ctx } = this;
        const zTime = parseInt(Date.now()/1000);
        let zOrderList = await this.app.mysql.get('db1').query(`select * from ctw_order where id=${pOrderId}`);
        let zPdList = await this.app.mysql.get('db1').query(`select * from ctw_order_pd where user_id=${pFrozenUserId}`);
        if(zOrderList && zOrderList[0] && zPdList && zPdList[0]){
            if(pPayType==1){
                //付钱超时-----------
                //付钱的封号，不用管了
                //收钱的重置数据：
                //ctw_order的to_id重置为-99
                await this.app.mysql.get('db1').query(`update ctw_order set to_id=-99, update_time=${zTime} where id=${pOrderId}`);
                //ctw_order_pd的sum-1，order_list空出一个
                let zPdOrderList = zPdInfo.order_list.replace(`,${pOrderId},`, `,`);
                let zPdInfo = zPdList[0];
                let zSum = zPdInfo.sum-1;
                if(zSum<=0){
                    zSum = 0;
                    zPdOrderList = "";
                }
                await this.app.mysql.get('db1').query(`update ctw_order_pd set sum=${zSum}, order_list='${zPdOrderList}', update_time=${zTime} where user_id=${pFrozenUserId}`);
            }else if(pPayType==2){
                //收钱确认超时-----------
                //收钱（pFrozenUserId）的让他队列满
                await this.app.mysql.get('db1').query(`update ctw_order_pd set sum=4, update_time=${zTime} where user_id=${pFrozenUserId}`);
                
                //付钱的（pResetUserId）直接过了
                await this.app.mysql.get('db1').query(`update ctw_order set status=2, confirm_time=${zTime}, update_time=${zTime} where id=${pOrderId} and from_id=${pResetUserId}`);
                await ctx.service.mJudge.orderOkJudge(pOrderId);
            }
        }
    }
}
module.exports = MPDService;