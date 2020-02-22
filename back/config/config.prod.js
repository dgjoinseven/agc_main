'use strict';

module.exports = appInfo => {
  const config = exports = {};
  const path = require('path');
  
  config.logger = {
    level: 'INFO',
    dir: path.join(__dirname, '../logs/prod/app') // 保存路径为工程路径下`logs/prod/app`
  };

  config.redis = {
    client: {
      port: 6379, // Redis port
      host: '127.0.0.1', // Redis host
      password: '',
      db: 2,
    },
  };
  
  //正式环境
  config.mysql = {
    clients:{   // 单数据库信息配置
      db1: {    //后台数据库
        host: '103.49.212.180',  // 端口号
        port: '3306', // 用户名
        user: 'root', // 密码
        password: 'xka@L33#S$Ys', // 数据库名
        database: 'agc_db',
        multipleStatements: true,
      },
    },
    app: true,    // 是否加载到 app 上，默认开启
    agent: false, // 是否加载到 agent 上，默认关闭
  };
  
  return config;
};
