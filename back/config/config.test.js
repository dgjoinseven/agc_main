'use strict';

module.exports = appInfo => {
  const config = exports = {};

  config.redis = {
    client: {
      port: 6379, // Redis port
      host: '127.0.0.1', // Redis host
      password: '',
      db: 1,
    },
  };
  
  //正式环境
  config.mysql = {
    clients:{   // 单数据库信息配置
      db1: {    //后台数据库
        host: '120.25.106.197',  // 端口号
        port: '3306', // 用户名
        user: 'root', // 密码
        password: '111111', // 数据库名
        database: 'ctw_db',
        multipleStatements: true,
      },
    },
    app: true,    // 是否加载到 app 上，默认开启
    agent: false, // 是否加载到 agent 上，默认关闭
  };
  
  return config;
};