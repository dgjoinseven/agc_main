'use strict';

const Service = require('egg').Service;
const ReturnCode = require('../utils/code');

class MDynService extends Service {
    constructor(ctx) {
        super(ctx);
    }

    /////////////////////////////////////////////// 动态奖金 ////////////////////////////////////////////////////
    //动态奖金列表
    async dynList(pParam) {
        const { ctx } = this;
        const zTokenInfo = ctx.helper.verifyToken(ctx.header.authorization);// 解密获取的Token
        let zTotalMoney = 0;
        let zCurRounds = pParam.rounds;

        const zSql = ` select * from ctw_dyn where user_id=${zTokenInfo.id}`;
        const zList = await this.app.mysql.get('db1').query(zSql);
        if(zList){
            let zDynInfo = zList[0];
            for(let i=1; i<=zCurRounds; i++){
                if(zDynInfo["dyn_"+i] != undefined){
                    zTotalMoney += Number(zDynInfo["dyn_"+i]);
                }
            }
            return { code:1, msg:'success', data:{ list:zList, rounds:zCurRounds, totalMoney:zTotalMoney}};
        }else{
            return null;
        }
    }

    //动态奖金记录列表
    async dynLogList(pParam) {
        const { ctx } = this;
        const zTokenInfo = ctx.helper.verifyToken(ctx.header.authorization);// 解密获取的Token
        const zToPage = pParam.to_page?pParam.to_page:1;
        const zPageSize = pParam.page_size?pParam.page_size:10;

        let zParamInfo = ``;
        if(pParam.dyn_type!=undefined){
            zParamInfo += `and a.dyn_type=${pParam.dyn_type} `;
        }
        if(pParam.from_user_id!=undefined){
            zParamInfo += `and a.from_user_id=${pParam.from_user_id} `;
        }
        if(pParam.to_user_id!=undefined){
            zParamInfo += `and a.to_user_id=${pParam.to_user_id} `;
        }
        if(pParam.rounds!=undefined){
            zParamInfo += `and a.rounds=${pParam.rounds} `;
        }
        const zSqlCount = `select count(distinct a.id) as count from ctw_log_dyn a LEFT JOIN ctw_user b ON a.from_user_id=b.id where a.id>0  ${zParamInfo}`;
        const zResCount = await this.app.mysql.get('db1').query(zSqlCount);
        const zTotalPage = zPageSize > 0 ? Math.ceil(zResCount[0].count / zPageSize) : 0;
        const zTotalCount = zResCount[0].count;

        const zSql = `select distinct a.id, a.dyn_type, a.from_user_id, a.to_user_id, a.rounds, a.pos, a.money, a.addr, a.create_time, b.img_id, b.name from ctw_log_dyn a LEFT JOIN ctw_user b ON a.from_user_id=b.id where a.id>0 ${zParamInfo} order by a.create_time desc limit ?,?`;
        const zOffset = (zToPage - 1) * zPageSize;
        const zList = await this.app.mysql.get('db1').query(zSql, [zOffset, parseInt(zPageSize)]);
        if(zList){
            return { code:1, msg:'success', data:{ cur_page:zToPage, page_size:zPageSize, total_page:zTotalPage, total_count:zTotalCount, list:zList }};
        }else{
            return null;
        }
    }
    
    //发送动态奖金(产生动态奖金)
    async genDynMoney(pUserId) {
        const { ctx } = this;
        const zTime = parseInt(Date.now()/1000);
        const zUserInfo = await ctx.service.mUser.getUserInfo(pUserId);
        let zCurRounds = zUserInfo.rounds;
        let zConfigDic = await this.ctx.helper.getConfigDic();
        let zConfMaxRounds = parseInt(zConfigDic["max_rounds"]);
        let zConfDynNum = parseInt(zConfigDic["dyn_num"]);
        let zConfRateDyn = parseFloat(zConfigDic["rate_dyn"]);
        let zDynMony = parseInt(zConfigDic["money_"+zCurRounds])*zConfRateDyn;

        if(zCurRounds==0){
            console.log(`genDynMoney() 天使轮不向上发放动态奖金`);
            return;
        }
        //向10个领导发送动态奖金(非特殊账号，不大于顶轮)
        if(zUserInfo.is_special==0 && zCurRounds<=zConfMaxRounds){
            let zBossList = zUserInfo.boss_list.split(",");
            let zDynCount = 1;
            for(let i=0; i<zBossList.length; i++){
                let zBossIdStr = zBossList[i];
                let zBossId = parseInt(zBossIdStr);
                if(zBossIdStr!=""){
                    //不能大于最大的动态奖金发放层数
                    if(zDynCount>zConfDynNum){
                        break;
                    }
                    //ctw_dyn累加动态奖金
                    console.log("ctw_dyn累加动态奖金------- zBossId:",zBossId);
                    let zListDyn = await this.app.mysql.get('db1').query(`select * from ctw_dyn where user_id=${zBossId}`);
                    if(zListDyn && zListDyn[0]){
                        console.log("ctw_dyn累加动态奖金---更新----");
                        //更新
                        let zUpdateParam = `dyn_${zCurRounds}=dyn_${zCurRounds}+${zDynMony}, update_time=${zTime}`;
                        await this.app.mysql.get('db1').query(`update ctw_dyn set ${zUpdateParam} where user_id=${zBossId}`);
                    }else{
                        console.log("ctw_dyn累加动态奖金---插入----");
                        console.log(zListDyn);
                        //插入
                        await this.app.mysql.get('db1').query(`insert into ctw_dyn (user_id, dyn_${zCurRounds}, create_time) values (${zBossId}, ${zDynMony}, ${zTime})`);
                    }
                    
                    //ctw_log_dyn生成动态奖金记录
                    await this.app.mysql.get('db1').query(`insert into ctw_log_dyn (dyn_type, from_user_id, to_user_id, rounds, pos, money, addr, create_time) values (1, ${zUserInfo.id}, ${zBossId}, ${zCurRounds}, ${zDynCount}, ${zDynMony}, '${zUserInfo.wallet_addr}', ${zTime})`);
                    
                    zDynCount ++;
                }
            }
        }
    }

    //结算本轮动态奖金
    async getDynMoney(pUserId) {
        const { ctx } = this;
        const zTime = parseInt(Date.now()/1000);
        const zUserInfo = await ctx.service.mUser.getUserInfo(pUserId);
        let zCurRounds = zUserInfo.rounds;
        // let zConfigDic = await this.ctx.helper.getConfigDic();
        let zTotalMoney = 0;
        let zUpdateParam = ``;

        let zListDyn = this.app.mysql.get('db1').query(`select * from ctw_dyn where user_id=${zUserInfo.id}`);
        if(zListDyn && zListDyn[0]){
            let zDynInfo = zListDyn[0];
            for(let i=1; i<=zCurRounds; i++){
                zTotalMoney += Number(zDynInfo["dyn_"+i]);
                zUpdateParam += `dyn_${i}=0,`
            }
            zUpdateParam += `update_time=${zTime},`;
            //更新ctw_dyn
            await this.app.mysql.get('db1').query(`update ctw_dyn set ${zUpdateParam} where user_id=${zUserInfo.id}`);
            //创建ctw_log_dyn
            await this.app.mysql.get('db1').query(`insert into ctw_log_dyn (dyn_type, from_user_id, to_user_id, rounds, pos, money, create_time) values (2, 0, ${zUserInfo.id}, ${zCurRounds}, 0, ${zTotalMoney}, ${zTime})`);
            //产生新订单
            await ctx.service.mBase.genOrder(zUserInfo.id, zUserInfo.rounds, 8, zTotalMoney);
        }else{
            return {code:-1, msg:`统计奖金失败！！不存在这样的动态奖金ctw_dyn， user_id=${zUserInfo.id}`};
        }
    }
    

}
module.exports = MDynService;