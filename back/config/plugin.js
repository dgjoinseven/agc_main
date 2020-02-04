'use strict';

/** @type Egg.EggPlugin */
module.exports = {
    mysql: {
      enable: true,
      package: 'egg-mysql',
    },
    redis:{
      enable: true,
      package: 'egg-redis',
    },
    cors:{
      enable: true,
      package: 'egg-cors',
    }
};
