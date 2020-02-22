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
      const zConfirmTime = parseInt(zConf.confirm_time)*3600;
      const zConfirmTimeJudge = zNowTime - zConfirmTime;
      // const zGroupTime = parseInt(zConf.group_time)*3600;
      // const zGroupTimeJudge = zNowTime - zGroupTime;
      let zSet = new Set();
      
      ctx.logger.info("开启定时任务 checkActive===========================");

      //执行RMB排单
      await ctx.service.mPD.startPD();

      //执行后台操作的订单（后台点确定）
      try {
        //后台点击的订单（公共账号确认，销毁账号确认）
        let zUserList = await app.mysql.get('db1').query(`select * from ctw_user where is_back_active=1`);
        if(zUserList && zUserList[0]){
          for(let zUserKey in zUserList){
            let zUserInfo = zUserList[zUserKey];
            console.log(`开始判断  username:${zUserInfo.name}  is_back_active=1 . . .`);
            //后台点击确认-通过订单判断醒觉，飞升，晋级
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
        let zOrderPaySql = `select a.id, a.from_id from ctw_order a LEFT JOIN ctw_user b ON a.from_id=b.id where a.create_time<${zPayTimeJudge} and a.status=0 and b.is_use=1`;
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

        //确认超时
        let zOrderConfirmSql = `select a.id, a.from_id from ctw_order a LEFT JOIN ctw_user b ON a.to_id=b.id where a.pay_time<${zConfirmTimeJudge} and a.pay_time>0 and a.status=1 and b.is_use=1`;
        let zOrderConfirmList = await app.mysql.get('db1').query(zOrderConfirmSql);
        if(zOrderConfirmList){ 
          for(let zOrderIndex in zOrderConfirmList){
            zSet.add(zOrderConfirmList[zOrderIndex].from_id);
            console.log("order:", zOrderConfirmList[zOrderIndex].from_id);

            //更新订单状态（pay_time）
            let zOrderUpdateSql = `update ctw_order set pay_time=${zNowTime} where id=${zOrderConfirmList[zOrderIndex].id}`;
            let zOrderUpdateResult = await app.mysql.get('db1').query(zOrderUpdateSql);
            if(zOrderUpdateResult && zOrderUpdateResult["affectedRows"]>0){
              console.log(` zOrderUpdateResult成功，orderId=${zOrderConfirmList[zOrderIndex].id}`);
            }else{
              ctx.logger.info(`zOrderUpdateResult失败! orderId不存在，orderId=${zOrderConfirmList[zOrderIndex].id}`);
            }
          }
        }


        // //直推团队超时
        // let zGroupSql = `select id from ctw_user where create_time<${zGroupTimeJudge} and is_use=1 and zt_sum<3`;
        // let zGroupSqlList = await app.mysql.get('db1').query(zGroupSql);
        // if(zGroupSqlList){
        //   for(let zGroupIndex in zGroupSqlList){
        //     zSet.add(zGroupSqlList[zGroupIndex].id);
        //     console.log("group:", zGroupSqlList[zGroupIndex].id);
        //   }
        // }

        // 遍历Set
        for (let zSetId of zSet) { 
          console.log(`遍历set id=${zSetId}`);
          let zUserInfo = await ctx.service.mUser.getUserInfo(zSetId);
          if(zUserInfo){
            // if(zUserInfo.recover_to==0){
              let zRecoverId = zUserInfo.boss_id;
              // if(zUserInfo.recover_to>0){
              //   let zUserBossInfo = await ctx.service.mUser.getUserInfo(zUserInfo.recover_to);
              //   if(zUserBossInfo){
              //     zRecoverId = zUserBossInfo.boss_id;
              //   }else{
              //     ctx.logger.info(`定时任务拿取User失败! recover user不存在，recoverId=${zUserInfo.recover_to}`);
              //     break;
              //   }
              // }
              // console.log(`update ctw_user set is_use=0, recover_to=${zRecoverId}, update_time=${zNowTime} where id=${zSetId}`);
              let zUpdateSql = `update ctw_user set is_use=0, recover_to=${zRecoverId}, create_time=${zNowTime}, update_time=${zNowTime} where id=${zSetId}`;
              let zResult = await app.mysql.get('db1').query(zUpdateSql);
              if(zResult && zResult["affectedRows"]>0){
                ctx.logger.info(`-=-=-= 定时任务recover成功，userId=${zSetId}`);
              }else{
                ctx.logger.info(`定时任务更新User失败! user不存在，userId=${zSetId}`);
              }
            // }else{
            //   console.log(`这个用户已经抛过给领导，不可再抛。`);
            //   //是否需要弄个列表记录着，然后集体清楚这些坏掉的订单，别在这里碍事
            // }
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
