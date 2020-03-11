'use strict';

//日期时间统计（年月日）
module.exports = app => {
  return {
    schedule: {
      cron: '0 0 4 * * *', //每天5点钟【秒 分 时 日 月 星期】
      type: 'worker', // 指定所有的 worker 都需要执行
      immediate: true,
      // disable: true, // 开发环境不执行
    },
    async task(ctx) {
      const zNowTime = parseInt(Date.now()/1000);
      const zConf = await ctx.helper.getConfigDic();

      ctx.logger.info("开启定时任务 schedule_0===========================");

      //执行分红
      // await ctx.service.mPD.startPD();

      //执行后台操作的订单（后台点确定）
      try {
      
      }catch (error) {
        throw error;
      }
    },
    
  };

};
