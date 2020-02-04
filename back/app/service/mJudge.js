'use strict';

const Service = require('egg').Service;
const ReturnCode = require('../utils/code');

class MJudgeService extends Service {
    constructor(ctx) {
        super(ctx);
    }

    /////////////////////////////////////////////// 判断 ////////////////////////////////////////////////////
    //订单被点确定后的判断
    //@orderId  订单id
    async orderOkJudge(pOrderId){
        const { ctx } = this;
        const zTime = parseInt(Date.now()/1000);
        let zIsNeedJudgeOut = false;
        let zSqlOrderList = await this.app.mysql.get('db1').query(`select * from ctw_order where id=${pOrderId}`);
        if(!zSqlOrderList || !zSqlOrderList[0]){
            console.log(`订单为空，操作失败！ order_id:${pOrderId}`);
            return {code:-1, msg:`订单为空，操作失败！ order_id:${pOrderId}`};
        }
        let zSqlOrderInfo = zSqlOrderList[0];

        //1.判断觉醒
        let zJudgeActived = await ctx.service.mJudge.judgeActived(zSqlOrderInfo);
        console.log("判断觉醒--------------zJudgeActived:",zJudgeActived.code);
        if(zJudgeActived.code == 1){
            //天使轮
            if(zSqlOrderInfo.rounds==0){
                //激活的order列表
                let zActiveOrderList = zJudgeActived.order_list;
                for(let i=0; i<zActiveOrderList.length; i++){
                    let zActiveOrderInfo = zActiveOrderList[i];
                    if(zActiveOrderInfo.is_angelActived == 0){
                        let zUpdateUserResult =  await this.app.mysql.get('db1').query(`update ctw_user set status=1 where id=${zActiveOrderInfo.active_id}`);
                        if(zUpdateUserResult && zUpdateUserResult["affectedRows"]>0){
                            await this.app.mysql.get('db1').query(`update ctw_order set is_angelActived=1 where id=${zActiveOrderInfo.id}`);
                        }else{
                            ctx.logger.info(`激活设置user失败！userId=${zJudgeActived.from_id}  rounds=${zSqlOrderInfo.rounds}`);
                        }
                    }
                }

                //天使轮打款达到3人，生成回馈700的订单(48小時内打款)
                if(zActiveOrderList.length>=3){
                    await ctx.service.mBase.genOrder(zSqlOrderInfo.from_id, 1, 7);
                }
            }else{
            //公排
                let zUpdateUserResult =  await this.app.mysql.get('db1').query(`update ctw_user set status=1 where id=${zJudgeActived.from_id}`);
                if(zUpdateUserResult && zUpdateUserResult["affectedRows"]>0){
                    //给上司发放动态奖金
                    await ctx.service.mDyn.genDynMoney(parseInt(zSqlOrderInfo.from_id));
                    
                    //结算本重天的动态奖金
                    await ctx.service.mDyn.getDynMoney(zSqlOrderInfo.from_id);

                    //1重天觉醒
                    if(zSqlOrderInfo.rounds==1){
                        //启动大转盘
                        await this.app.mysql.get('db1').query(`update ctw_user set lotto_status=1 where id=${zSqlOrderInfo.from_id}`);
                    }
                    
                    //本轮的觉醒可激活之前不可见的单子
                    await ctx.service.mJudge.judgeOpenOrder(zSqlOrderInfo.from_id);
                }else{
                    ctx.logger.info(`激活设置user失败！userId=${zJudgeActived.from_id}  rounds=${zSqlOrderInfo.rounds}`);
                }
            }
            ctx.logger.info(`激活设置user成功，status=1，userId=${zJudgeActived.from_id}`);
            zIsNeedJudgeOut = true;
        }else{
            console.log(zJudgeActived.code, zJudgeActived.msg);
            return {code:zJudgeActived.code, msg:zJudgeActived.msg};
        }

        //2.判断飞升
        let zOutFinishList = [];
        console.log("判断飞升--------------zIsNeedJudgeOut:",zIsNeedJudgeOut);
        if(zIsNeedJudgeOut==true){
            let zOutList = await ctx.service.mJudge.judgeOut(zSqlOrderInfo);
            if(zOutList && zOutList.length>0){
                for(let i=0; i<zOutList.length; i++){
                    let zOutListInfo = zOutList[i];
                    let zUpdateOutResult =  await this.app.mysql.get('db1').query(`update ctw_user set status=2 where id=${zOutListInfo.id}`);
                    if(zUpdateOutResult && zUpdateOutResult["affectedRows"]>0){
                        ctx.logger.info(`出场设置user成功，status=2，userId=${zOutListInfo.id}`);
                        zOutFinishList.push(zOutListInfo);
                    }else{
                        ctx.logger.info(`出场设置user失败！userId=${zOutListInfo.id}`);
                    }
                }
            }
        }

        //3.判断晋级
        console.log("判断晋级--------------zOutFinishList:",zOutFinishList.length);
        await ctx.service.mJudge.judgeLvUp(zOutFinishList);
    }
    
    //判断觉醒
    //@pOrderInfo   单个订单信息（数据表里面的一个数据）
    async judgeActived(pOrderInfo) {
        const { ctx } = this;
        //  1.1 天使轮rounds=0，给自己直属上司打3笔
        //  1.2 公排rounds=1-19，给自己的上2级打，给公司账号打
        let zSqlOrderList;
        let zSql=``;
        switch(parseInt(pOrderInfo.rounds)){
            case 0://天使轮
                //判断已打款给自己的直属上司的3笔订单是否都已经确定状态
                zSql = `select * from ctw_order where from_id=${pOrderInfo.from_id} and to_id=${pOrderInfo.to_id} and rounds=0 and status=2`;
                zSqlOrderList = await this.app.mysql.get('db1').query(zSql);
                if(zSqlOrderList && zSqlOrderList[0]){
                    return {code:1, msg:`验证给直属上司打款成功，round=${pOrderInfo.rounds}, count=${zSqlOrderList[0].count}`, from_id:pOrderInfo.from_id, order_list:zSqlOrderList};
                }else{
                    return {code:-1, msg:`验证给直属上司打款失败，订单列表为空！round=${pOrderInfo.rounds}`};
                }
                break;
            default://公排
                //获取用户
                let zRoundsUserInfo = await ctx.service.mUser.getRoundsUserInfo(pOrderInfo.from_id, pOrderInfo.rounds);
                if(!zRoundsUserInfo){
                    return {code:-1, msg:`找不到相对应的用户id，添加失败！ userId=${pOrderInfo.from_id}`};
                }
                //自己前2级的上司id表
                let zBossListStr = `${zRoundsUserInfo.boss_1_id},${zRoundsUserInfo.boss_2_id},0,-1`;
                console.log("zBossListStr:",zBossListStr);
                //判断
                zSql = `select count(id) as count from ctw_order where from_id=${pOrderInfo.from_id} and to_id in(${zBossListStr}) and rounds=${pOrderInfo.rounds} and status=2`;
                zSqlOrderList = await this.app.mysql.get('db1').query(zSql);
                if(zSqlOrderList && zSqlOrderList[0]){
                    if(zSqlOrderList[0].count>=4){
                        return {code:1, msg:`验证给2级上司+公共账号+销毁账号 打款成功，round=${pOrderInfo.rounds}, count=${zSqlOrderList[0].count}`, from_id:pOrderInfo.from_id};
                    }else{
                        return {code:10, msg:`订单提交成功，但是2级上司+公共账号+销毁账号 打款未足！round=${pOrderInfo.rounds},  count=${zSqlOrderList[0].count}/4`};
                    }
                }else{
                    return {code:-1, msg:`验证给2级上司+公共账号+销毁账号 打款失败，订单列表为空！round=${pOrderInfo.rounds}`};
                }
                break;
        }
    }

    //判断飞升
    //@pOrderInfo   单个订单信息（数据表里面的一个数据）
    async judgeOut(pOrderInfo) {
        const { ctx } = this;
        //获取用户
        let zUserInfo = await ctx.service.mUser.getUserInfo(pOrderInfo.from_id);
        if(!zUserInfo){
            console.log(`找不到相对应的zUserInfo用户id！ userId=${pOrderInfo.from_id}`);
            return null;
        }
        let zConfigDic = await this.ctx.helper.getConfigDic();
        let zConfMaxRounds = parseInt(zConfigDic["max_rounds"]);

        let zOutList = [];
        if(parseInt(pOrderInfo.rounds)==0){//天使轮
            //天使轮判断ctw_user以自己为顶点的2层三角形(3^n)，一共13人如果都为醒觉状态，则飞升
            
            //生成自己和自己影响的2个上司的顶点
            let zBossList=[];
            zBossList.push(pOrderInfo.from_id);
            if(zUserInfo.boss_id != 0){
                let zBossUserInfo = await ctx.service.mUser.getUserInfo(zUserInfo.boss_id);
                if(parseInt(zBossUserInfo.is_special)==0){
                    zBossList.push(zUserInfo.boss_id);
                }
            }
            if(zUserInfo.boss_id_2 != 0){
                let zBossUserInfo = await ctx.service.mUser.getUserInfo(zUserInfo.boss_id_2);
                if(parseInt(zBossUserInfo.is_special)==0){
                    zBossList.push(zUserInfo.boss_id_2);
                }
            }

            //遍历zBossList为顶点的3层三角形的状态
            for(let i=0; i<zBossList.length; i++){
                let zIdSet = new Set();
                let zTopPoint = zBossList[i];
                let zTopUserInfo = await ctx.service.mUser.getUserInfo(zTopPoint);
                if(!zTopUserInfo){
                    console.log(`zTopUserInfo 找不到相对应的用户id！ userId=${zTopPoint}`);
                    continue;
                }
                if(!zTopUserInfo.rounds>=zConfMaxRounds){
                    console.log(`已经飞升到顶，不往下继续执行！ userId=${zTopPoint}`);
                    continue;
                }
                
                //获得推荐人列表有该个点的所有点
                let zTopPointList = await this.app.mysql.get('db1').query(`select * from ctw_user where boss_id=${zTopUserInfo.id} or boss_id_2=${zTopUserInfo.id}`);
                let zMax = 12;
                if(zTopPointList && zTopPointList.length>0){
                    for(let j=0; j<zTopPointList.length; j++){
                        zIdSet.add(zTopPointList[j].id);
                    }
                }
                console.log(`judgeOut == i=${i}/${zBossList.length}, userId=${zTopUserInfo.id}`);
                let zIdArrayStr = Array.from(zIdSet).join(",");
                // console.log("zIdArrayStr:",zIdArrayStr);
                if(zIdArrayStr && zIdArrayStr!=""){
                    let zPointCountList = await this.app.mysql.get('db1').query(`select * from ctw_user where id in(${zIdArrayStr}) and status=1 and rounds>=0 `);
                    if(zPointCountList && zPointCountList[0]){
                        if(zPointCountList.length>=zMax){
                            console.log(`飞升成功，顶点=${zTopUserInfo.id}, count=${zPointCountList.length}/${zMax}`);
                            zOutList.push(zTopUserInfo);
                        }else{
                            console.log(`判断飞升数量没达到要求！顶点=${zTopUserInfo.id}, count=${zPointCountList.length}/${zMax}`);
                        }
                    }else{
                        console.log(`判断飞升数量没达到要求！顶点=${zTopUserInfo.id}, count=${zPointCountList.length}/${zMax}`);
                    }
                }else{
                    console.log(`没有关联节点，不能检测，顶点=${zTopUserInfo.id}`);
                }
            }   
        }else{//公排
            //公排判断ctw_rounds 相对应的rounds以自己为顶点的2层三角形(2^n)，一共7人，左右两条线任意都有一个人为觉醒状态，则飞升
            let zRoundsUserInfo = await ctx.service.mUser.getRoundsUserInfo(pOrderInfo.from_id, pOrderInfo.rounds);
            if(!zRoundsUserInfo){
                console.log(`找不到相对应的zRoundsUserInfo用户id！ userId=${pOrderInfo.from_id}`);
                return null;
            }
            
            let zBossList=[];
            zBossList.push(pOrderInfo.from_id);
            if(zRoundsUserInfo.boss_1_id){
                zBossList.push(zRoundsUserInfo.boss_1_id);
            }
            if(zRoundsUserInfo.boss_2_id){
                zBossList.push(zRoundsUserInfo.boss_2_id);
            }

            //遍历zBossList为顶点的3层三角形的状态
            let zMax = 2;
            for(let i=0; i<zBossList.length; i++){
                let zIdSet = new Set();
                let zTopPoint = zBossList[i];
                let zTopUserInfo = await ctx.service.mUser.getUserInfo(zTopPoint);
                if(!zTopUserInfo){
                    console.log(`zTopUserInfo 找不到相对应的用户id！ userId=${zTopPoint}`);
                    continue;
                }
                if(!zTopUserInfo.rounds>=zConfMaxRounds){
                    console.log(`已经飞升到顶端，不往下继续执行！ userId=${zTopPoint}`);
                    continue;
                }

                let zSlaveList_1 = await this.app.mysql.get('db1').query(`select a.user_id, b.status, b.rounds as user_rounds from ctw_rounds a LEFT JOIN ctw_user b ON a.user_id=b.id where a.boss_1_id=${zTopUserInfo.id} and a.rounds=${pOrderInfo.rounds} `);
                let zOutCount = 0;
                if(zSlaveList_1){
                    for(let i=0; i<zSlaveList_1.length; i++){
                        let zRoundsUserInfo_slave_1 = zSlaveList_1[i];
                        //如果1级下属当前轮数大于订单轮数，则算合格
                        if(zRoundsUserInfo_slave_1.user_rounds > pOrderInfo.rounds){
                            zOutCount += 1;
                            continue;
                        //如果1级下属当前轮数等于订单轮数，并且status>=1，则算合格
                        }else if(zRoundsUserInfo_slave_1["status"]>=1 && zRoundsUserInfo_slave_1.user_rounds==pOrderInfo.rounds){
                            zOutCount += 1;
                            continue;
                        //如果1级下属不合格，则判断2级下属
                        }else{
                            let zSlaveList_2 = await this.app.mysql.get('db1').query(`select a.user_id, b.status, b.rounds as user_rounds from ctw_rounds a LEFT JOIN ctw_user b ON a.user_id=b.id where a.boss_1_id=${zRoundsUserInfo_slave_1.user_id} and a.boss_2_id=${zTopUserInfo.id} and a.rounds=${pOrderInfo.rounds} `);
                            if(zSlaveList_2 && zSlaveList_2[0]){
                                if(zSlaveList_2[0].user_rounds > pOrderInfo.rounds){
                                    zOutCount += 1;
                                    continue;
                                }else if(zSlaveList_2[0]["status"]>=1 && zSlaveList_2[0].user_rounds==pOrderInfo.rounds){
                                    zOutCount += 1;
                                    continue;
                                }
                            }else if(zSlaveList_2 && zSlaveList_2[1]){
                                if(zSlaveList_2[1].user_rounds > pOrderInfo.rounds){
                                    zOutCount += 1;
                                    continue;
                                }else if(zSlaveList_2[1]["status"]>=1 && zSlaveList_2[1].user_rounds==pOrderInfo.rounds){
                                    zOutCount += 1;
                                    continue;
                                }
                            }
                        }
                    }
                }
                if(zOutCount>=2){
                    console.log(`飞升成功，顶点=${zTopUserInfo.id}, count=${zOutCount}/${zMax}`);
                    zOutList.push(zTopUserInfo);
                }else{
                    console.log(`判断出场数量没达到要求！顶点=${zTopUserInfo.id}, count=${zOutCount}/${zMax}`);
                }
            }
        }
        return zOutList;
    }

    //判断是否可以晋级（设置ctw_user is_lv=1）
    //@zOutFinishList    飞升名单
    async judgeLvUp(zOutFinishList) {
        const { ctx } = this;
        if(zOutFinishList && zOutFinishList.length>0){
            for(let zKey in zOutFinishList){
                let zOutListInfo = zOutFinishList[zKey];
                let zUpdateOutResult =  await this.app.mysql.get('db1').query(`update ctw_user set is_lv=1 where id=${zOutListInfo.id}`);
                if(zUpdateOutResult && zUpdateOutResult["affectedRows"]>0){
                    ctx.logger.info(`晋级成功，userId=${zOutListInfo.id}, rounds=${zOutListInfo.rounds+1}`);
                }else{
                    ctx.logger.info(`晋级失败！userId=${zOutListInfo.id}, rounds=${zOutListInfo.rounds+1}`);
                }
            }
        }
    }

    //判断是否让订单生效（对象变为醒觉态，订单可见，create_time变为当前时间，开始计时48小时支付失效）
    async judgeOpenOrder(pUserId) {
        const { ctx } = this;
        //获取用户
        let zUserInfo = await ctx.service.mUser.getUserInfo(pUserId);
        if(!zUserInfo){
            console.log(`找不到相对应的zUserInfo用户id！ userId=${pUserId}`);
            return null;
        }
        //如果状态为觉醒，则打开order
        if(zUserInfo.status>0){
            console.log("打开订单----------", zUserInfo.id, zUserInfo.name, zUserInfo.status);
            const zTime = parseInt(Date.now()/1000);
            await this.app.mysql.get('db1').query(`update ctw_order set is_use=1, create_time=${zTime}, update_time=${zTime} where to_id=${zUserInfo.id} and rounds=${zUserInfo.rounds}`);
        }
    }

    
}
module.exports = MJudgeService;