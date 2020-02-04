'use strict';
const moment = require('moment');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const TOTP = require('totp.js');
const ReturnCode = require('../utils/code');

// const schedule = require('node-schedule');
module.exports = {
  Sum(param){
    return param.reduce((prev,cur)=>{return prev + cur},0)
  },
//   schedule() {
//     return schedule;
//   },
  md5(pParam, pSalt) {
    return crypto.createHmac('sha1', pSalt).update(pParam).digest('hex');
  },
  generateSalt(){
    let zNum = ["0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"];
    let zResult = "";
    for(let i=0; i<4; i++){
      zResult += zNum[Math.round(Math.random()*(zNum.length-1))];
    }
    return zResult;
  },
  totp() {
    return TOTP;
  },
  generateToken(param) {
    console.log("-=-=-=-=", param, this.app.config.userToken.secret);
    const token = jwt.sign(param, this.app.config.userToken.secret, {
        expiresIn: 60 * 60 * 24 * 7, // expires in 7 day
    });
    return token;
  },
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

  //检查id是否有效(对一个操作更新之前，先查看主键是否存在)
  async checkCodeOk(pTable, pCode){
    if(!pCode){
        return {code:1004, msg:'pCode不能为空，操作失败'};
    }
    //检查id
    let zCheckId = await this.app.mysql.get('db1').query(`select count(id) as count from ${pTable} where code="${pCode}"`);
    if(!zCheckId || zCheckId[0].count<=0){
      return {code:1010, msg:'将要执行的成员不存在，执行失败'};
    }
  },

  //检查员工不能进行该项操作
  async checkWorkerCanNotDo(){
    const zTokenInfo = this.ctx.helper.verifyToken(this.ctx.header.authorization);// 解密获取的Token
    if(zTokenInfo && zTokenInfo.type==2){
      return {code:1014, msg:'员工不能进行该项操作'};
    }
  },

  //检查pos_type是否合格
  async checkPosType(pPosType){
    if(pPosType<1 || pPosType>3 ){
        return { code:10005, msg:ReturnCode[10005], data:"pos_type:"+pPosType };
    }
  },

  //检查account是否为空
  async checkAccount(pAccount){
    if(!pAccount){
        return { code:2003, msg:ReturnCode[2003], data:"account:"+pAccount };
    }
  },

  //检查密码是否为空
  async checkPwd(pPwd){
    if(!pPwd){
        return { code:2002, msg:ReturnCode[2002], data:"pwd:"+pPwd };
    }
  },

  //检查name是否为空
  async checkName(pName){
    if(!pName){
        return { code:10006, msg:ReturnCode[10006], data:"name:"+pName };
    }
  },

  dateDiff(timestamp) {
    // 补全为13位
    const arrTimestamp = (timestamp + '').split('');
    for (let start = 0; start < 13; start++) {
      if (!arrTimestamp[start]) {
        arrTimestamp[start] = '0';
      }
    }
    timestamp = arrTimestamp.join('') * 1;

    const minute = 1000 * 60;
    const hour = minute * 60;
    const day = hour * 24;
    const halfamonth = day * 15;
    const month = day * 30;
    const now = new Date().getTime();
    const diffValue = now - timestamp;

    // 如果本地时间反而小于变量时间
    if (diffValue < 0) {
      return '最新';
    }

    // 计算差异时间的量级
    const monthC = diffValue / month;
    const weekC = diffValue / (7 * day);
    const dayC = diffValue / day;
    const hourC = diffValue / hour;
    const minC = diffValue / minute;

    // 数值补0方法
    const zero = function(value) {
      if (value < 10) {
        return '0' + value;
      }
      return value;
    };

    // 使用
    if (monthC > 12) {
      // 超过1年，直接显示年月日
      return (function() {
        const date = new Date(timestamp);
        return date.getFullYear() + '年' + zero(date.getMonth() + 1) + '月' + zero(date.getDate()) + '日';
      })();
    } else if (monthC >= 1) {
      return parseInt(monthC) + '月前';
    } else if (weekC >= 1) {
      return parseInt(weekC) + '周前';
    } else if (dayC >= 1) {
      return parseInt(dayC) + '天前';
    } else if (hourC >= 1) {
      return parseInt(hourC) + '小时前';
    } else if (minC >= 1) {
      return parseInt(minC) + '分钟前';
    }
    return '刚刚';
  },
  timeFormat(timestamp) {
    // 补全为13位
    const arrTimestamp = (timestamp + '').split('');
    for (let start = 0; start < 13; start++) {
      if (!arrTimestamp[start]) {
        arrTimestamp[start] = '0';
      }
    }
    timestamp = arrTimestamp.join('') * 1;

    let zResutl = moment(timestamp).format('YYYY-MM-DD HH:mm:ss');
    if(zResutl == "Invalid date"){
      return null;
    }else{
      return zResutl;
    }
  },
  blockAwardStat(height) {
    if (!height) {
      return false;
    } else if (height >= 200000) {
      return 3;
    } else if (height >= 100000) {
      return 2;
    } else if (height >= 40000) {
      return 1;
    }
    return 0.1;

  },
  signEncryption(addressArr,moneyArr,timestamp){
    const md5 = crypto.createHash('md5');
    let addressArrStr = addressArr.toString();
    let moneyArrStr = moneyArr.toString();
    return md5.update(this.app.config.signkey + timestamp+addressArrStr+moneyArrStr).digest('hex');

  },
	timestampToDate(timestamp,joinStr='') {
		return moment(timestamp).format('YYYY'+joinStr+'MM'+joinStr+'DD');
	},
	async timestampToHoursAndMinutes(timestamp){
		return moment(timestamp).format('HH:mm');
	},
  
  async forMachineSqlData(machine,address) {
    let array =[];
    let keysArray = Object.keys(machine);
    for (let i = 0; i < keysArray.length; i++) {
      let keyArray = [];
      let newValue = {};
      keyArray.push(keysArray[i]);
      let value = machine[keysArray[i]];
      newValue.name = keysArray[i] || null;
      newValue.hr = value.hr || null;
      let blockTimeInfo ={
        where :{login:address,loginId:newValue.name},
        columns:['timestamp'],
        orders:[['timestamp','desc']],
        limit:1
      }
      let blockTime = await this.ctx.service.getaccountinfo.getMinerTime(blockTimeInfo);
      if(blockTime.length > 0 ){
        newValue.blockTime = blockTime[0].timestamp;
      } else {
        newValue.blockTime = null;
      }
      array.push(newValue);
    }
    return array;
  },
	getDayTimestamp(timestamp){
  	const date = moment(timestamp).format('YYYY-MM-DD');
  	const day = {
  		st:new Date(date + " 00:00:00.0").getTime(),
		  et:new Date(date + " 23:59:59.0").getTime()
	  }
  	return day;
	},
	async jsonDecode(str){
		if(typeof str === 'string') {
			try {
				var obj = JSON.parse(str);
				if(typeof obj == 'object' && obj){
					return obj
				}
			} catch (e) {
				return false;
			}
		}

		return false;
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
        await this.app.redis.set("configDic", zDataStr, 'EX', 60*60);
      }
    }
    return JSON.parse(zDataStr);
  },


};
