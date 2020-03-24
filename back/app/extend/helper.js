'use strict';

const fs = require('fs');
const path = require('path');
const moment = require('moment');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
// const TOTP = require('totp.js');
// const ReturnCode = require('../utils/code');

module.exports = {

  //md5
  md5(pParam, pSalt) {
    return crypto.createHmac('sha1', pSalt).update(pParam).digest('hex');
  },

  //产生加密盐值
  generateSalt(){
    // let zNum = ["0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"];
    // let zResult = "";
    // for(let i=0; i<4; i++){
    //   zResult += zNum[Math.round(Math.random()*(zNum.length-1))];
    // }
    let zResult = Math.random().toString(36).substr(2, 4);
    return zResult;
  },

  //产生token
  generateToken(param) {
    const token = jwt.sign(param, this.app.config.userToken.secret, {
        expiresIn: 60 * 60 * 24 * 7, // expires in 7 day
    });
    return token;
  },

  //验证token
  verifyToken(param) {
    try {
        const decoded = jwt.verify(param, this.app.config.userToken.secret);
        return decoded;
    } catch (error) {
        throw error;
    }
  },

  //检查id是否有效(对一个操作更新之前，先查看主键是否存在)
  async checkIdOk(pTable, pId){
    if(!pId){
        return {code:1004, msg:'id不能为空，操作失败'};
    }
    //检查id
    let zCheckId = await this.app.mysql.get('db1').query(`select count(id) as count from ${pTable} where id=${pId}`);
    if(!zCheckId || zCheckId[0].count<=0){
      return {code:1010, msg:'将要执行的id不存在，执行失败'};
    }
  },

  //@pTimestamp 时间戳
  //@pIsShowTime 是否显示时间（0不显示时间只显示日期  1显示日期+时间 ）
  timeFormat(pTimestamp, pIsShowTime) {
    // 补全为13位
    const arrTimestamp = (pTimestamp + '').split('');
    for (let start = 0; start < 13; start++) {
      if (!arrTimestamp[start]) {
        arrTimestamp[start] = '0';
      }
    }
    pTimestamp = arrTimestamp.join('') * 1;

    let zResutl;
    if(pIsShowTime==0){
      zResutl = moment(pTimestamp).format('YYYY-MM-DD');
    }else{
      zResutl = moment(pTimestamp).format('YYYY-MM-DD HH:mm:ss');
    }

    if(zResutl == "Invalid date" || !zResutl){
      return null;
    }else{
      return zResutl;
    }
  },

  //获取配置字典
  async getConfigDic(){
    let zDataStr = await this.app.redis.get("configDic");
    if(!zDataStr){
      let zResult = await this.app.mysql.get('db1').query(`select * from ctw_config`);
      if(zResult && zResult[0]){
        let zData = {}
        for(let i=0; i<zResult.length; i++){
          let zInfo = zResult[i];
          zData[zInfo.conf_name] = zInfo.conf_value;
        }
        zDataStr = JSON.stringify(zData);
        await this.app.redis.set("configDic", zDataStr, 'EX', 60);
      }
    }
    return JSON.parse(zDataStr);
  },

  //获取当前的汇率
  async getCurExchange(){
    // let zDataStr = await this.app.redis.get("exchange");
    // if(!zDataStr){
    //   let zResult = await this.app.mysql.get('db1').query(`select * from ctw_exchange order by create_time desc`);
    //   if(zResult && zResult[0]){
    //     let zInfo = zResult[0];
    //     zDataStr = Number(zInfo.rate).toFixed(2)
    //     await this.app.redis.set("exchange", zDataStr, 'EX', 60);
    //   }
    // }
    // return Number(zDataStr);
    return 1;
  },

  //获取当前的分红
  async getCurFhPool(){
    await this.app.redis.del("fh_pool");
    let zDataStr = await this.app.redis.get("fh_pool");
    if(!zDataStr){
      let zResult = await this.app.mysql.get('db1').query(`select * from ctw_fh_pool order by create_time desc`);
      if(zResult && zResult[0]){
        let zInfo = zResult[0];
        zDataStr = JSON.stringify(zInfo);
        await this.app.redis.set("fh_pool", zDataStr, 'EX', 60);
      }
    }
    return JSON.parse(zDataStr);
  },
  async delCurFhpool(){
    await this.app.redis.del("fh_pool");
  },

  /**
   * 获取文件上传目录
   */
  async getUploadFile(pFilename) {
    const zTime = Date.now();
    // 1、获取当前日期     20180920
    let zDay = moment(zTime).format('YYYYMMDD');
    // 2、创建图片保存的路径
    let zBaseDir = this.ctx.app.baseDir;
    let zDir = path.join(zBaseDir, './uploadimg/', zDay)
    const zDirExists = fs.existsSync(zDir);
    if (!zDirExists) {
      fs.mkdirSync(path.join(zBaseDir, './uploadimg/'));
    }
    // 返回图片保存的路径
    let zUploadDir = path.join(zDir, zTime + "_" + pFilename);
    return {
      zUploadDir,
      saveDir: zUploadDir.replace(/\\/g, '/'),
    };
  },

};
