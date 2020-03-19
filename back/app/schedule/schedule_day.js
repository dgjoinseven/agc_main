'use strict';

//每天统计一次的定时任务
module.exports = app => {
  return {
    schedule: {
      cron: '0 0 4 * * *', //每天5点钟【秒 分 时 日 月 星期】
      type: 'worker', // 指定所有的 worker 都需要执行
      immediate: true,
      // disable: true, // 开发环境不执行
    },
    async task(ctx) {
      const zNowTime = parseInt(new Date()/1000);
      const zConf = await ctx.helper.getConfigDic();
      const zConfMaxRounds = zConf["max_rounds"];
      const zConfOutMaxTime = parseInt(zConf["out_max_time"])*86400;
      const zFConfFhPool = parseInt(zConf["fh_pool"]);
      const zOutTime = zNowTime - zConfOutMaxTime;
      ctx.logger.info("开启定时任务 schedule_day ===========================");
      
      //执行后台操作的订单（后台点确定）
      try {
        //判断出局的时限，设定出局分红结束状态
        await app.mysql.get('db1').query(`update ctw_user set is_out=2 where out_time<${zOutTime} and is_out=1`);

        //更新分红池信息
        await ctx.service.mBase.fhPooUpdate();

        //执行出局分红
        let zFhUserList = await app.mysql.get('db1').query(`select * from ctw_user where is_out=1`);
        if(zFhUserList && zFhUserList[0]){
          //参与分红的总人数
          let zFhPeopleSum = zFhUserList.length;

          let zFhPoolSingle = Math.floor(zFConfFhPool / zFhPeopleSum);
          for(let i=0; i<zFhUserList.length; i++){
            let zFhUserInfo = zFhUserList[i];
            await ctx.service.mBase.genOrder(zFhUserInfo.id, zConfMaxRounds, 9, zFhPoolSingle);
            await app.mysql.get('db1').query(`insert into ctw_log_fh (user_id, rounds, money, create_time) values (${zFhUserInfo.id}, ${zFhUserInfo.rounds}, ${zFhPoolSingle}, ${zNowTime})`);
          }
        }

      }catch (error) {
        throw error;
      }
    },
    
  };

};
