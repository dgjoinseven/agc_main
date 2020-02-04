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

  config.cluster = {
    listen: {
      path: '',
      port: 7002,
      hostname: '0.0.0.0',
    }
};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1570963241812_2919';
  
  // add your middleware config here
  config.middleware = [];

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };

  // 修改config/config.default.js
  config.static = {
    prefix: '/',
    dir: process.cwd() + '/public'
  };

  config.rundir = process.cwd() + '/run';

  config.cors = {
    origin: () => '*',
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH',
  };

  config.security = {
    xframe: {
      enable: false,
    },
    // 关闭csrf
    csrf: {
      enable: false,
      ignoreJson: true,
    },
    domainWhiteList: ['*'],
    methodnoallow: {
      enable: false,
    },
  };
  config.multipart = {
    fileSize: '100mb',
  };

  // config.multipart = {
  //   mode:'file',
  // }

  config.pwd_salt = 'ctw-admin';
  config.userToken = {
    secret: 'ctw-admin',
  };

  return {
    ...config,
    ...userConfig,
  };
};
