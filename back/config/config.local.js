/* eslint valid-jsdoc: "off" */

'use strict';

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {};
  
  config.img_url = `http://127.0.0.1/agc/agc_main/back/uploadimg`;

  config.redis = {
    client: {
      port: 6379, // Redis port
      host: '120.25.106.197', // Redis host
      password: '',
      db: 2,
    },
  };
  
  //本地环境
  config.mysql = {
    clients:{   // 单数据库信息配置
      db1: {    //后台数据库
        host: '120.25.106.197',  // 端口号
        port: '3306', // 用户名
        user: 'root', // 密码
        password: '111111', // 数据库名
        database: 'agc_db',
        multipleStatements: true,
      },
    },
    app: true,    // 是否加载到 app 上，默认开启
    agent: false, // 是否加载到 agent 上，默认关闭
  };

  config.email = {
    //host: 'smtpdm.aliyun.com',
    host: 'smtp.sg.aliyun.com',
    secureConnection: true,
    port: 465,
    auth: {
        user: 'business@dmtc.io', //注册的邮箱账号
        pwd: 'Dmtc888!'
    }
};

  return config;
};
