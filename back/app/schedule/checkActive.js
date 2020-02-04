'use strict';

//日期时间统计（年月日）
module.exports = app => {
  return {
    schedule: {
      interval: '600s', // 时间间隔(10分钟)
      type: 'worker', // 指定所有的 worker 都需要执行
      immediate: true,
      // disable: true, // 开发环境不执行
    },
    async task(ctx) {
      const zNowTime = parseInt(Date.now()/1000);
      const zConf = await ctx.helper.getConfigDic();
      const zPayTime = parseInt(zConf.pay_time)*3600;
      const zPayTimeJudge = zNowTime - zPayTime;
      const zGroupTime = parseInt(zConf.group_time)*3600;
      const zGroupTimeJudge = zNowTime - zGroupTime;
      let zSet = new Set();
      
      ctx.logger.info("开启定时任务 checkActive===========================");
      // 989691d416ac8d076dcaa8891f6ecce3f87b70b8
      // 63m5
      // let zSalt1 = "cjgh";
      // let zSalt2 = "2dxt";
      // let zSalt3 = "ux8h";
      // let zPwd1 = ctx.helper.md5("111111", zSalt1);
      // let zPwd2 = ctx.helper.md5("111111", zSalt2);
      // let zPwd3 = ctx.helper.md5("111111", zSalt3);
      // console.log("pwd=1=======", zPwd1, zSalt1);
      // console.log("pwd=2=======", zPwd2, zSalt2);
      // console.log("pwd=3=======", zPwd3, zSalt3);
      //c1a dd64dddf4f67d5cb145e343173ce1e899febd353  jh8x
      //c1b 
      //c1c 

      try {
        //后台点击的订单（公共账号确认，销毁账号确认）
        let zUserList = await app.mysql.get('db1').query(`select * from ctw_user where is_back_active=1`);
        if(zUserList && zUserList[0]){
          for(let zUserKey in zUserList){
            let zUserInfo = zUserList[zUserKey];
            console.log(`开始判断  username:${zUserInfo.name}  is_back_active=1 . . .`);
            //通过订单判断醒觉，飞升，晋级
            let zOrderList = await app.mysql.get('db1').query(`select * from ctw_order where from_id=${zUserInfo.id} and to_id=0 and status=2 and rounds=${zUserInfo.rounds}`);
            if(zOrderList && zOrderList[0]){
              await ctx.service.mJudge.orderOkJudge(zOrderList[0].id);
            }
            
            //还原is_back_active=0
            await app.mysql.get('db1').query(`update ctw_user set is_back_active=0 where id=${zUserInfo.id} `);
          }
        }else{
          console.log("定时任务checkActive没有要处理的东西");
        }


        //支付超时
        let zOrderPaySql = `select a.id, a.from_id from ctw_order a LEFT JOIN ctw_user b ON a.from_id=b.id where a.create_time<${zPayTimeJudge} and a.status<2 and b.is_use=1`;
        let zOrderPayList = await app.mysql.get('db1').query(zOrderPaySql);
        if(zOrderPayList){ 
          for(let zOrderIndex in zOrderPayList){
            zSet.add(zOrderPayList[zOrderIndex].from_id);
            console.log("order:", zOrderPayList[zOrderIndex].from_id);

            //更新订单状态（create_time）
            let zOrderUpdateSql = `update ctw_order set create_time=${zNowTime} where id=${zOrderPayList[zOrderIndex].id}`;
            let zOrderUpdateResult = await app.mysql.get('db1').query(zOrderUpdateSql);
            if(zOrderUpdateResult && zOrderUpdateResult["affectedRows"]>0){
              console.log(` zOrderUpdateResult成功，orderId=${zOrderPayList[zOrderIndex].id}`);
            }else{
              ctx.logger.info(`zOrderUpdateResult失败! orderId不存在，orderId=${zOrderPayList[zOrderIndex].id}`);
            }
          }
        }

        //直推团队超时
        let zGroupSql = `select id from ctw_user where create_time<${zGroupTimeJudge} and is_use=1 and zt_sum<3`;
        let zGroupSqlList = await app.mysql.get('db1').query(zGroupSql);
        if(zGroupSqlList){
          for(let zGroupIndex in zGroupSqlList){
            zSet.add(zGroupSqlList[zGroupIndex].id);
            console.log("group:", zGroupSqlList[zGroupIndex].id);
          }
        }

        // 遍历Set
        for (let zSetId of zSet) { 
          console.log(`遍历set id=${zSetId}`);
          let zUserInfo = await ctx.service.mUser.getUserInfo(zSetId);
          if(zUserInfo){
            let zRecoverId = zUserInfo.boss_id;
            if(zUserInfo.recover_to>0){
              let zUserBossInfo = await ctx.service.mUser.getUserInfo(zUserInfo.recover_to);
              if(zUserBossInfo){
                zRecoverId = zUserBossInfo.boss_id;
              }else{
                ctx.logger.info(`定时任务拿取User失败! recover user不存在，recoverId=${zUserInfo.recover_to}`);
                break;
              }
            }
            // console.log(`update ctw_user set is_use=0, recover_to=${zRecoverId}, update_time=${zNowTime} where id=${zSetId}`);
            let zUpdateSql = `update ctw_user set is_use=0, recover_to=${zRecoverId}, create_time=${zNowTime}, update_time=${zNowTime} where id=${zSetId}`;
            let zResult = await app.mysql.get('db1').query(zUpdateSql);
            if(zResult && zResult["affectedRows"]>0){
              ctx.logger.info(`-=-=-= 定时任务recover成功，userId=${zSetId}`);
            }else{
              ctx.logger.info(`定时任务更新User失败! user不存在，userId=${zSetId}`);
            }
          }else{
            ctx.logger.info(`定时任务拿取User失败! user不存在，userId=${zSetId}`);
          }
        }
      }catch (error) {
        throw error;
      }
    },
    
  };

};
