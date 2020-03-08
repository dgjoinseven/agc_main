'use strict';

const Service = require('egg').Service;
const ReturnCode = require('../utils/code');

class MBaseService extends Service {
    constructor(ctx) {
        super(ctx);
    }
    
    //汇率列表
    async exchangeList() {
        const { ctx } = this;
        const zTokenInfo = ctx.helper.verifyToken(ctx.header.authorization);// 解密获取的Token
        const zSql = ` select * from ctw_exchange order by create_time desc`;
        const zList = await this.app.mysql.get('db1').query(zSql);
        if(zList){
            return { code:1, msg:'success', data:{ list:zList }};
        }else{
            return null;
        }
    }

    //乐透开奖
    async lottoStart() {
        const { ctx } = this;
        const zTokenInfo = ctx.helper.verifyToken(ctx.header.authorization);
        const zTime = parseInt(Date.now()/1000);
        const zLottoResult = Math.round(Math.random()*100); //中奖值
        let zWinType = 0;
        let zMony = 0;
        let zIsChaoXian = 0;
        let zMax = 0;
        let zLottoCount = 0;
        let zUserInfo = await ctx.service.mUser.getUserInfo(zTokenInfo.id);
        if(zUserInfo){
            if(zUserInfo.lotto_status==2){
                return { code:1027, msg:`已经中奖，不能再次抽奖， user_id:${zTokenInfo.id}`};
            }
            const zConfSql = ` select * from ctw_lotto_conf`;
            const zConfList = await this.app.mysql.get('db1').query(zConfSql);
            if(zConfList && zConfList.length>=5){
                let zWin_list = [   {"min":-1, "max":-1},
                                    {"min":zConfList[0].rate, "max":zConfList[1].rate},
                                    {"min":zConfList[1].rate, "max":zConfList[1].rate+zConfList[2].rate},
                                    {"min":zConfList[1].rate+zConfList[2].rate, "max":zConfList[1].rate+zConfList[2].rate+zConfList[3].rate},
                                    {"min":zConfList[1].rate+zConfList[2].rate+zConfList[3].rate, "max":zConfList[1].rate+zConfList[2].rate+zConfList[3].rate+zConfList[4].rate},
                                ];
                zWinType = 0;
                zMony = zConfList[0].money;
                for(let zIndex in zWin_list){
                    let zInfo = zWin_list[zIndex];
                    //落入中奖区间
                    if(zLottoResult>=zInfo.min && zLottoResult<zInfo.max){
                        //该奖项还有余量
                        let zConfInfo = zConfList[zIndex];
                        zMax = zConfInfo.max;
                        zLottoCount = zConfInfo.count;
                        if(zConfInfo.count < zConfInfo.max ){
                            zWinType = zIndex;
                            zMony = zConfInfo.money + Math.round(Math.random()*zConfInfo.offset)*2 - zConfInfo.offset;
                            //更新获奖信息
                            await this.app.mysql.get('db1').query(`update ctw_lotto_conf set count=count+1 where lotto_type=${zWinType}`); // 初始化事务
                        }else{ //发完奖了
                            zIsChaoXian = 1;
                        }
                        break;
                    }
                }

                //更新用户
                await this.app.mysql.get('db1').query(`update ctw_user set lotto_status=2 where id=${zTokenInfo.id}`);
                //清除缓存
                await ctx.service.mUser.delUserInfo(zTokenInfo.id);
                //写入获奖记录
                await this.app.mysql.get('db1').query(`insert into ctw_lotto_list (user_id, lotto_type, money, is_chaoxian, max, count, create_time) values (${zTokenInfo.id}, ${zWinType}, ${zMony}, ${zIsChaoXian}, ${zMax}, ${zLottoCount}, ${zTime})`);
                //产生新订单
                await ctx.service.mBase.genOrder(zUserInfo.id, 1, 6, zMony);

                console.log(` 获奖结果======  zLottoResult=${zLottoResult},  zWinType=${zWinType},  zMony=${zMony},  user_id:${zTokenInfo.id}, zIsChaoXian=${zIsChaoXian}`);
                return { code:1, msg:`success`,  data:{ lottoType:zWinType, money:zMony}};
            }else{
                return { code:-1, msg:`lotto配置表为空， user_id:${zTokenInfo.id}`};
            }
        }else{
            return { code:-1, msg:`用户不存在， user_id:${zTokenInfo.id}`};
        }
    }

    //QA列表
    async qaList() {
        const { ctx } = this;
        const zTokenInfo = ctx.helper.verifyToken(ctx.header.authorization);// 解密获取的Token
        const zSql = ` select * from ctw_qa where user_id=${zTokenInfo.id} order by create_time desc`;
        const zList = await this.app.mysql.get('db1').query(zSql);
        if(zList){
            return { code:1, msg:'success', data:{ list:zList }};
        }else{
            return null;
        }
    }

    //QA编辑（添加）
    async qaEdit(pParam) {
        const { ctx } = this;
        const zTokenInfo = ctx.helper.verifyToken(ctx.header.authorization);// 解密获取的Tokenid
        const zTime = parseInt(Date.now()/1000);

        //1天只能提交一次提问
        let zUserInfo = await ctx.service.mUser.getUserInfo(zTokenInfo.id);
        if(!zUserInfo){
            return { code:-1, msg:`用户不存在， user_id:${zTokenInfo.id}`};
        }
        let zConfigDic = await this.ctx.helper.getConfigDic();
        let zTotalTime = zUserInfo.qa_time + parseInt(zConfigDic.qa_time)*3600;
        if( zTotalTime > zTime){
            return { code:1028, msg:`1天只能提一个问题`};
        }

        //提交问题
        let zParam = ` ${zTokenInfo.id}, '${pParam.question}', ${zTime} `;
        let zSql = `insert into ctw_qa (user_id, question, create_time) values (?,?,?)`;
        var zParamValue = [zTokenInfo.id, pParam.question, zTime];
        const zResult = await this.app.mysql.get('db1').query(zSql, zParamValue); // 初始化事务
        if(zResult && zResult["affectedRows"]>0){
            //更新用户状态
            await this.app.mysql.get('db1').query(`update ctw_user set qa_time=${zTime}, update_time=${zTime} where id=${zTokenInfo.id}`);
            //清除缓存
            await ctx.service.mUser.delUserInfo(zTokenInfo.id);
            return { code:1, msg:`success`, data:pParam};
        }else{
            return { code:-1, msg:`问题添加失败`};
        }
    }

    //团队列表
    async groupList(pParam) {
        const { ctx } = this;
        // const zTokenInfo = ctx.helper.verifyToken(ctx.header.authorization);// 解密获取的Token
        let zSql;
        let zParamValue = [];
        if(parseInt(pParam.rounds)==0){
            //天使轮
            zSql = ` select id, name, status, img_id from ctw_user where boss_id=? `;
            zParamValue.push(pParam.id);
        }else{
            //公排
            let zRounds = parseInt(pParam.rounds);
            zSql = ` select distinct a.id as gpId, a.user_id as id, b.name, b.status, b.img_id from ctw_rounds_${zRounds} a LEFT JOIN ctw_user b ON a.user_id=b.id where a.boss_1_id=? and a.rounds=?`;
            zParamValue.push(pParam.id);
            zParamValue.push(pParam.rounds);
        }
        
        const zList = await this.app.mysql.get('db1').query(zSql, zParamValue);
        if(zList){
            return { code:1, msg:'success', data:{ list:zList, id:pParam.id, lv:pParam.lv, pos:pParam.pos, rounds:pParam.rounds }};
        }else{
            return null;
        }
    }

    //公告列表
    async noticeList(pParam) {
        const { ctx } = this;
        const zSql = ` select * from ctw_notice order by create_time desc`;
        const zList = await this.app.mysql.get('db1').query(zSql);
        if(zList){
            return { code:1, msg:'success', data:{ list:zList}};
        }else{
            return null;
        }
    }

    //评论列表
    async commentList(pParam) {
        const { ctx } = this;
        // const zTokenInfo = ctx.helper.verifyToken(ctx.header.authorization);// 解密获取的Token
        const zToPage = pParam.to_page?pParam.to_page:1;
        const zPageSize = pParam.page_size?pParam.page_size:10;
        let zParamInfo = ``;

        const zSqlCount = `select count(id) as count from ctw_comment where id>0 ${zParamInfo}`;
        const zResCount = await this.app.mysql.get('db1').query(zSqlCount);
        const zTotalPage = zPageSize > 0 ? Math.ceil(zResCount[0].count / zPageSize) : 0;
        const zTotalCount = zResCount[0].count;
        const zSql = `select * from ctw_comment where id>0 ${zParamInfo} order by create_time desc limit ?,?`;
    	const zOffset = (zToPage - 1) * zPageSize;
        const zList = await this.app.mysql.get('db1').query(zSql, [zOffset, parseInt(zPageSize)]);
        if(zList){
            return { code:1, msg:'success', data:{ cur_page:zToPage, page_size:zPageSize, total_page:zTotalPage, total_count:zTotalCount, list:zList}};
        }else{
            return null;
        }
    }
    
    //评论编辑
    async commentEdit(pParam) {
        const { ctx } = this;
        const zTokenInfo = ctx.helper.verifyToken(ctx.header.authorization);// 解密获取的Tokenid
        const zTime = parseInt(Date.now()/1000);

        let zParam = ` ?,?,?,? `;
        let zParamValue = [pParam.user_id, pParam.user_name, pParam.contents, zTime];
        let zSql = `insert into ctw_comment (user_id, user_name, contents, create_time) values (`+zParam+`)`;
        const zResult = await this.app.mysql.get('db1').query(zSql, zParamValue); // 初始化事务
        if(zResult && zResult["affectedRows"]>0){
            return { code:1, msg:`success`, data:pParam};
        }else{
            return { code:-1, msg:`评论添加失败`};
        }
    }

    /////////////////////////////////////////////// 集市 ////////////////////////////////////////////////////
    //集市-加持
    //@to_page
    //@page_size
    //@rounds   需要加持的轮数
    async marketJcList(pParam) {
        const { ctx } = this;
        // const zTokenInfo = ctx.helper.verifyToken(ctx.header.authorization);// 解密获取的Tokenid
        // const zTime = parseInt(Date.now()/1000);
        const zToPage = pParam.to_page?pParam.to_page:1;
        const zPageSize = pParam.page_size?pParam.page_size:10;
        let zParamInfo = ``;
        const zConf = await ctx.helper.getConfigDic();
        const zConfMaxRounds = parseInt(zConf.max_rounds);
        let zRounds = parseInt(pParam.rounds);
        for(let i=0; i<zConfMaxRounds; i++){
            let zIndex = i+1;
            zParamInfo += `a.jc_${zIndex}>=${zRounds} and `;
        }
        zParamInfo += ` a.id>0 and b.is_showMarket=1 `;

        const zSqlCount = `select count(distinct a.id) as count from ctw_jc a LEFT JOIN ctw_user b ON a.user_id=b.id where ${zParamInfo}`;
        const zResCount = await this.app.mysql.get('db1').query(zSqlCount);
        const zTotalPage = zPageSize > 0 ? Math.ceil(zResCount[0].count / zPageSize) : 0;
        const zTotalCount = zResCount[0].count;
    	const zOffset = (zToPage - 1) * zPageSize;

        const zSql = ` select distinct a.id, a.*, b.name, b.tel, b.remark from ctw_jc a LEFT JOIN ctw_user b ON a.user_id=b.id where ${zParamInfo} order by a.update_time limit ?,?`;
        const zList = await this.app.mysql.get('db1').query(zSql, [zOffset, parseInt(zPageSize)]);
        if(zList && zList[0]){
            return { code:1, msg:'success', data:{ cur_page:zToPage, page_size:zPageSize, total_page:zTotalPage, total_count:zTotalCount, list:zList}};
        }else{
            return null;
        }
    }

    //集市-邀请挂靠点
    //@to_page
    //@page_size
    async marketInvitationList(pParam) {
        const { ctx } = this;
        // const zTokenInfo = ctx.helper.verifyToken(ctx.header.authorization);// 解密获取的Tokenid
        // const zTime = parseInt(Date.now()/1000);
        const zToPage = pParam.to_page?pParam.to_page:1;
        const zPageSize = pParam.page_size?pParam.page_size:10;
        let zParamInfo = ``;
        zParamInfo += ` zt_sum<3 and is_showMarket=1 `;

        const zSqlCount = `select count(id) as count from ctw_user where ${zParamInfo}`;
        const zResCount = await this.app.mysql.get('db1').query(zSqlCount);
        const zTotalPage = zPageSize > 0 ? Math.ceil(zResCount[0].count / zPageSize) : 0;
        const zTotalCount = zResCount[0].count;
    	const zOffset = (zToPage - 1) * zPageSize;

        const zSql = ` select name, tel, remark from ctw_user where ${zParamInfo} order by create_time desc limit ?,?`;
        const zList = await this.app.mysql.get('db1').query(zSql, [zOffset, parseInt(zPageSize)]);
        if(zList && zList[0]){
            return { code:1, msg:'success', data:{ cur_page:zToPage, page_size:zPageSize, total_page:zTotalPage, total_count:zTotalCount, list:zList}};
        }else{
            return null;
        }
    }


    /////////////////////////////////////////////// 用户 ////////////////////////////////////////////////////
    //用户详情
    async userDetail(pParam) {
        const { ctx } = this;
        const zTokenInfo = ctx.helper.verifyToken(ctx.header.authorization);// 解密获取的Tokenid
        const zTime = parseInt(Date.now()/1000);

        const zSql = ` select id,name,account,img_id,boss_id,boss_id_2,boss_list,is_lv,pwd2,status,rounds,wallet_addr,bank_addr,alipay_addr,is_special,lotto_status,tel,remark from ctw_user where id=${zTokenInfo.id} `;
        const zUserList = await this.app.mysql.get('db1').query(zSql);
        const zExchangeList = await this.app.mysql.get('db1').query(`select * from ctw_exchange order by id desc`);
        if(zUserList && zExchangeList){
            return { code:1, msg:'success', data:{ userInfo:zUserList[0], exchangeList:zExchangeList }};
        }else{
            return null;
        }
    }

    //账号编辑
    async userEdit(pParam) {
        const { ctx } = this;
        const zTokenInfo = ctx.helper.verifyToken(ctx.header.authorization);// 解密获取的Token
        let zSql = ``;
        let zParam = ``;
        let zParamValue = [];
        let zResult = {};
        let zSalt = ctx.helper.generateSalt();
        let zPwd;
        const zTime = parseInt(Date.now()/1000);
        const zCK = await ctx.helper.checkIdOk("ctw_user", zTokenInfo.id);
        switch(parseInt(pParam.type)){
            case 1://增加
                //昵称不能为空
                if(!pParam.name){
                    return {code:-1, msg:`昵称不能为空`};
                }
                //账号不能为空
                if(!pParam.account){
                    return {code:-1, msg:`账号不能为空`};
                }
                //密码不能为空
                if(!pParam.pwd){
                    return {code:-1, msg:`密码不能为空`};
                }
                //账号/昵称不能重复（这个由数据库的索引做过限制）
                
                //创建团队人数不超过3人
                let zGroupList = await this.app.mysql.get('db1').query(`select count(id) as count from ctw_user where boss_id=${zTokenInfo.id}`);
                if(zGroupList && zGroupList[0]){
                    if(zGroupList[0].count >= 3){
                        return {code:1018, msg:ReturnCode[1018]};
                    }
                }
                //获取创建人的信息
                let zCreaterUserInfo = await ctx.service.mUser.getUserInfo(zTokenInfo.id);
                if(!zCreaterUserInfo){
                    return {code:-1, msg:`找不到相对应的用户id，添加失败！ userId=${zTokenInfo.id}`};
                }
                zPwd = ctx.helper.md5(pParam.pwd, zSalt);
                
                //距离上次帮人注册，不超过一定时间
                let zConfigDic = await this.ctx.helper.getConfigDic();
                if(parseInt(zConfigDic.is_zt_time)==1){
                    let zNextRegisterTime = zCreaterUserInfo.register_time + parseInt(zConfigDic.zt_time)*3600;
                    if(zTime < zNextRegisterTime){
                        return {code:1025, msg:ReturnCode[1025]};
                    }
                }
                
                //计算boss_list
                let zBossListStr = ``;
                if(zCreaterUserInfo.boss_id!=0){
                    zBossListStr = `,${zTokenInfo.id}${zCreaterUserInfo.boss_list}`;
                }else{
                    zBossListStr = `,${zTokenInfo.id},`;
                }
                zParam = ` '?', '?', '?', '?', ?, ?, '?', ? `;
                zParamValue = [pParam.name, pParam.account, zPwd, zSalt, zTokenInfo.id, zTokenInfo.boss_id, zBossListStr, zTime];
                zSql = `insert into ctw_user (name, account, pwd, salt, boss_id, boss_id_2, boss_list, create_time) values (`+zParam+`)`;
                break;
            case 2://修改
                if(zCK){ return zCK }
                let zEditUserInfo = await ctx.service.mUser.getUserInfo(pParam.id);
                if(pParam.pwd){
                    zPwd = ctx.helper.md5(pParam.pwd, zSalt);
                    zParam += ` pwd='?' ,`;  zParamValue.push(zPwd);
                    zParam += ` salt='?' ,`;  zParamValue.push(zSalt);
                }
                if(pParam.pwd2){
                    let zSalt2 = ctx.helper.generateSalt();
                    let zPwd2 = ctx.helper.md5(pParam.pwd2, zSalt2);
                    zParam += ` pwd2='?' ,`;  zParamValue.push(zPwd2);
                    zParam += ` salt2='?' ,`;  zParamValue.push(zSalt2);
                }
                if(pParam.wallet_addr!=undefined){
                    if(zEditUserInfo.wallet_addr){
                        return {code:1029, msg:`地址不可重复设置`};
                    }
                    zParam += ` wallet_addr='?', `;  zParamValue.push(pParam.wallet_addr);
                }
                if(pParam.bank_addr!=undefined){
                    if(zEditUserInfo.bank_addr){
                        return {code:1033, msg:`银行信息不可重复设置`};
                    }
                    zParam += ` bank_addr='?', `;  zParamValue.push(pParam.bank_addr);
                }
                if(pParam.alipay_addr!=undefined){
                    if(zEditUserInfo.alipay_addr){
                        return {code:1034, msg:`支付宝不可重复设置`};
                    }
                    zParam += ` alipay_addr='?', `;  zParamValue.push(pParam.alipay_addr);
                }
                if(pParam.tel!=undefined){
                    zParam += ` tel='?', `;  zParamValue.push(pParam.tel);
                }
                if(pParam.img_id!=undefined){
                    zParam += ` img_id='?', `;  zParamValue.push(pParam.img_id);
                }
                zParam += ` update_time=? `;  zParamValue.push(zTime);
                zParamValue.push(pParam.id);
                zSql = `update ctw_user set ${zParam} where id=?`;
                break;
        }
        zResult = await this.app.mysql.get('db1').query(zSql, zParamValue); // 初始化事务
        if(zResult && zResult["affectedRows"]>0){
            //如果是添加用户（邀请）
            if(parseInt(pParam.type)==1){
                //创建动态奖金表
                await this.app.mysql.get('db1').query(`insert into ctw_dyn (user_id, create_time, update_time) values (${zTokenInfo.id}, ${zTime}, ${zTime})`);

                //创建加持表
                await this.app.mysql.get('db1').query(`insert into ctw_jc (user_id, create_time, update_time) values (${zTokenInfo.id}, ${zTime}, ${zTime})`);

                //直推总数+1
                await this.app.mysql.get('db1').query(`update ctw_user set zt_sum=zt_sum+1, register_time=${zTime} where id=${zTokenInfo.id}`);
                //清除缓存
                await ctx.service.mUser.delUserInfo(zTokenInfo.id);

                //新添加一条给天使轮上级打款的订单
                if(zTokenInfo.is_special){
                    return { code:1, msg:`success`, data:pParam};
                }
                let zGenOrderResult = false;
                let zCreaterUserInfo = await ctx.service.mUser.getUserInfo(zTokenInfo.id);
                if(zCreaterUserInfo.is_special==1){
                    zGenOrderResult = true;
                }else{
                    let zCreateList = await this.app.mysql.get('db1').query(`select * from ctw_user where boss_id=${zTokenInfo.id} order by create_time desc`);
                    if(zCreateList && zCreateList[0]){
                        zGenOrderResult = await ctx.service.mBase.genOrder(zCreaterUserInfo.id, 0, 1, 0, zCreateList[0].id);
                    }
                }
                if(zGenOrderResult){
                    return { code:1, msg:`success`, data:pParam};
                }else{
                    return { code:-1, msg:`生成新单子失败`};
                }
            }else{
                //清除缓存
                await ctx.service.mUser.delUserInfo(zTokenInfo.id);

                return {code:1, msg:'success', data:pParam, result:zResult};
            }
        }else{
            return {code:1005, msg:ReturnCode[1005]};
        }
    }

    //用户升级
    async userLevleUp(pParam) {
        const { ctx } = this;
        const zTokenInfo = ctx.helper.verifyToken(ctx.header.authorization);// 解密获取的Tokenid
        const zTime = parseInt(Date.now()/1000);
        let zConfigDic = await this.ctx.helper.getConfigDic();
        let zConfMaxRounds = parseInt(zConfigDic["max_rounds"]);

        let zUserInfo = await ctx.service.mUser.getUserInfo(zTokenInfo.id);
        if(!zUserInfo){
            return { code:-1, msg:`获取用户失败，user_id=${zTokenInfo.id}`};
        }

        let zNextRounds = zUserInfo.rounds+1;

        //判断是否特殊账号
        if(zUserInfo.is_special==1){
            return { code:-1, msg:`特殊账号不能升级，user_id=${zTokenInfo.id}`};
        }

        //判断够不够加持数
        let zMaxJcSum = parseInt(zConfigDic[`jcmax_${zNextRounds}`]);
        let zCurJcSum = parseInt(zUserInfo.jc_sum);
        if(zCurJcSum<zMaxJcSum){
            return { code:1035, msg:`加持数量不足，user_id=${zTokenInfo.id}`};
        }
        
        let zSql = `update ctw_user set is_lv=0, rounds=${zNextRounds}, status=0, jc_sum=0, update_time=${zTime} where id=${zTokenInfo.id} and is_lv=1 `;
        const zResult = await this.app.mysql.get('db1').query(zSql); // 初始化事务
        if(zResult && zResult["affectedRows"]>0){
            //清除缓存
            await ctx.service.mUser.delUserInfo(zTokenInfo.id);
            
            if(zUserInfo.rounds<zConfMaxRounds){
                //把user添加到新的公排队列
                let zAddRoundUserResult = await ctx.service.mBase.addRoundUser(zUserInfo.id);
                //产生新订单
                let zGenOrderResult = await ctx.service.mBase.genOrder(zUserInfo.id, (zUserInfo.rounds+1));

                if(zAddRoundUserResult && zGenOrderResult){
                    return { code:1, msg:`success`, data:pParam};
                }else{
                    return { code:-1, msg:`生成新单子失败`};
                }
            }else{
                ctx.logger.info(`已达到最大轮数，不能晋级，rounds=${zUserInfo.rounds}`);
            }
            return { code:1, msg:`success`, data:pParam};
        }else{
            return { code:-1, msg:`升级失败`};
        }
    }

    //添加公排用户队列
    async addRoundUser(pUserId) {
        const { ctx } = this;
        let zSql = ``;
        let zParam = ``;
        let zResult = {};
        const zTime = parseInt(Date.now()/1000);
        let zUserInfo = await ctx.service.mUser.getUserInfo(pUserId);
        let zUserId = parseInt(zUserInfo.id);
        let zRounds = parseInt(zUserInfo.rounds);
        let zBossInfo;

        ////////////////////// 优先排列到天使轮的领导旗下 //////////////////////
        let zBossHavePoint;
        if(zUserInfo.boss_list){
            let zBossIdList = zUserInfo.boss_list.split(",");
            let zBossIdCountList = [];
            for(let i=0; i<zBossIdList.length; i++){
                let zBossIdStr = zBossIdList[i];
                if(zBossIdStr!=""){
                    let zBossId = parseInt(zBossIdStr);
                    zBossIdCountList.push(zBossId);
                }
            }
            let zBossNewStr = zBossIdCountList.join(",");
            zBossHavePoint = await this.app.mysql.get('db1').query(`select distinct a.id as a_id, b.* from ctw_user a LEFT JOIN ctw_rounds_${zRounds} b ON a.id=b.user_id where b.zt_sum<2 and b.rounds=${zRounds} and b.user_id in(${zBossNewStr}) and a.is_use=1 order by b.id`);
        }
        
        if(zBossHavePoint && zBossHavePoint[0]){
            //如果有天使轮的boss空挂靠点
            zBossInfo = zBossHavePoint[0];
        }else{
            //如果没有天使轮的boss空挂靠点，但是有闲散挂靠点

            ////////////////////// 闲散按照从上到下，从左到右的顺序插入三角形队列 //////////////////////
            //获取将要挂靠的boss信息
            let zBossInfoList = await this.app.mysql.get('db1').query(`select * from ctw_rounds_${zRounds} where zt_sum<2 and rounds=${zRounds} order by id`);
            if(zBossInfoList && zBossInfoList[0]){
                zBossInfo = zBossInfoList[0];
            }else{
                //连闲散点都没有，只能挂在第二排的第一个人下面
                let zDaBossList = await this.app.mysql.get('db1').query(`select * from ctw_rounds_${zRounds} where rounds=${zRounds} order by id`);
                zBossInfo = zDaBossList[1];
            }
        }

        //插入
        zParam = ` ${zUserId}, ${zRounds},  ${zBossInfo.user_id}, ${zBossInfo.boss_1_id}, ${zTime} `;
        zSql = `insert into ctw_rounds_${zRounds} (user_id, rounds, boss_1_id, boss_2_id, create_time) values (${zParam})`;
        zResult = await this.app.mysql.get('db1').query(zSql);
        if(zResult && zResult["affectedRows"]>0){
            //boss推荐人数统计+1
            await this.app.mysql.get('db1').query(`update ctw_rounds_${zRounds} set zt_sum=zt_sum+1 where id=${zBossInfo.id} and rounds=${zRounds}`);
            return true;
        }else{
            ctx.logger.error(`addRoundUser失败！！插入失败，zSql=${zSql}`);
            return false;
        }
    }

    //冻结用户
    //@pPayType  1付钱  2收钱确认
    async fronzenUser(pFrozenUserId, pResetUserId, pOrderId, pPayType) {
        const { ctx } = this;
        let zUserInfo = await ctx.service.mUser.getUserInfo(pFrozenUserId);
        if(zUserInfo){
            let zParam = ``;
            if(zUserInfo.rounds==0){ //天使轮
                await ctx.service.mPD.resetPD(pFrozenUserId, pResetUserId, pOrderId, pPayType);

                zParam += `is_use=0, `;
                zParam += `update_time=${zNowTime} `;
            }else{ //公排
                zParam += `account='f${pFrozenUserId}', `;
                zParam += `pwd='d7a1b9e05367224e69b4ebf70d13675e8584393e', `;
                zParam += `salt='ptrz', `;
                zParam += `wallet_addr='${zConf["frozen_addr"]}', `;
                zParam += `is_use=2, `;
                zParam += `update_time=${zNowTime} `;
            }
            let zUpdateSql = `update ctw_user set ${zParam} where id=${pFrozenUserId}`;
            let zResult = await app.mysql.get('db1').query(zUpdateSql);
            if(zResult && zResult["affectedRows"]>0){
                //清除缓存
                await ctx.service.mUser.delUserInfo(pFrozenUserId);

                ctx.logger.info(`-=-=-= 定时任务成功，userId=${pFrozenUserId}`);
            }else{
                ctx.logger.info(`定时任务更新User失败! user不存在，userId=${pFrozenUserId}`);
            }
        }else{
        ctx.logger.info(`定时任务拿取User失败! user不存在，userId=${pFrozenUserId}`);
        }
    }

    //获取加持列表
    async jcList(pParam) {
        const { ctx } = this;
        const zTokenInfo = ctx.helper.verifyToken(ctx.header.authorization);// 解密获取的Tokenid
        const zTime = parseInt(Date.now()/1000);
        
        const zSql = ` select * from ctw_jc where user_id=${zTokenInfo.id} `;
        const zList = await this.app.mysql.get('db1').query(zSql);
        if(zList && zList[0]){
            return { code:1, msg:'success', data:{ list:zList[0] }};
        }else{
            return null;
        }
    }

    //加持谁
    //@jc_rounds    使用哪一轮的加持
    //@jc_name      加持对象的昵称
    async jcWho(pParam) {
        const { ctx } = this;
        const zTokenInfo = ctx.helper.verifyToken(ctx.header.authorization);// 解密获取的Tokenid
        const zTime = parseInt(Date.now()/1000);
        const zConf = await ctx.helper.getConfigDic();
        const zConfMaxRounds = parseInt(zConf.max_rounds);
        const zUserInfo = ctx.helper.getUserInfoByName(jc_name);
        
        if(!zUserInfo){
            return {code:-1, msg:'加持对象不存在' };
        }
        if(zRounds<1 || zRounds>zConfMaxRounds){
            return {code:-1, msg:'轮数超过范围' };
        }
        if(parseInt(zUserInfo.id)==parseInt(zTokenInfo.id)){
            return {code:1036, msg:'不能加持自己' };
        }

        let zRounds = parseInt(jc_rounds);
        let zToRounds = (zUserInfo.rounds + 1);

        //验证ctw_jc的对应轮数是否有加持次数，并且加持的对象的轮数是否符合标准（大于等于加持对象的轮数）
        let zSelectJc = await this.app.mysql.get('db1').query(`select * from ctw_jc where jc_${zRounds}>=${zToRounds} and user_id=${zTokenInfo.id}`);
        if(!zSelectJc || !zSelectJc[0]){
            return {code:-1, msg:`没有加持次数或者被加持者轮数太高,${zRounds},${zToRounds}` };
        }

        //扣ctw_jc的加持次数
        await this.app.mysql.get('db1').query(`update ctw_jc set jc_${zRounds}=-1 where user_id=${zTokenInfo.id}`);

        //加持对象jc_sum增加
        let zSql = `update ctw_user set jc_sum=jc_sum+1, update_time=${zTime} where id=${zUserInfo.id} `;
        const zResult = await this.app.mysql.get('db1').query(zSql); // 初始化事务
        if(zResult && zResult["affectedRows"]>0){
            //清除缓存
            await ctx.service.mUser.delUserInfo(zUserInfo.id);
            
            return { code:1, msg:`success`, data:pParam};
        }else{
            return { code:-1, msg:`加持失败`};
        }

    }

    /////////////////////////////////////////////// 订单 ////////////////////////////////////////////////////
    //订单列表
    async orderList(pParam) {
        const { ctx } = this;
        // const zTokenInfo = ctx.helper.verifyToken(ctx.header.authorization);// 解密获取的Token
        let zParamInfo = ``;
        let zParamValue = [];
        if(pParam.isFinish==1){
            zParamInfo += ` and (a.from_id=? or a.to_id=?) and a.status>=2`;
            zParamValue = [pParam.id, pParam.id];
        }else{
            zParamInfo += ` and (a.from_id=? or a.to_id=?) and a.status<2`;
            zParamValue = [pParam.id, pParam.id];
        }
        const zSql = ` select distinct a.id, a.*, b.name as from_name, b.tel as from_tel, b.wallet_addr as from_addr, b.bank_addr as from_bank, b.alipay_addr as from_alipay, b.img_id as from_img_id, c.name as to_name, c.tel as to_tel, c.wallet_addr as to_addr, c.bank_addr as to_bank, c.alipay_addr as to_alipay, c.img_id as to_img_id from ctw_order a LEFT JOIN ctw_user b ON a.from_id=b.id LEFT JOIN ctw_user c ON a.to_id=c.id  where a.id>0 ${zParamInfo} order by a.create_time desc`;
        const zList = await this.app.mysql.get('db1').query(zSql, zParamValue);
        if(zList){
            return { code:1, msg:'success', data:{list:zList} };
        }else{
            return null;
        }
    }

    //设置订单信息
    async orderSetInfo(pParam) {
        const { ctx } = this;
        const zTokenInfo = ctx.helper.verifyToken(ctx.header.authorization);// 解密获取的Token
        let zSql = '';
        let zParam = ``;
        let zParamValue = [];
        let zResult = {};
        const zTime = parseInt(Date.now()/1000);
        const zCK = await ctx.helper.checkIdOk("ctw_order", pParam.id);

        if(!pParam.id){ return {code:-1, msg:'订单id不能为空'}; }
        
        if(pParam.tran_id!=undefined){
            zParam += ` tran_id='?' ,`;  zParamValue.push(pParam.tran_id);
        }
        zParam += ` update_time=? `;  zParamValue.push(zTime);
        zParamValue.push(pParam.id);

        zSql = `update ctw_order set ${zParam} where id=?`;
        zResult = await this.app.mysql.get('db1').query(zSql, zParamValue);
        if(zResult && zResult["affectedRows"]>0){
            return {code:1, msg:'success', data:pParam, result:zResult};
        }else{
            return {code:-1, msg:'data为空，操作失败'};
        }
    }

    //订单编辑
    async orderEdit(pParam) {
        const { ctx } = this;
        const zTokenInfo = ctx.helper.verifyToken(ctx.header.authorization);// 解密获取的Token
        let zSql = '';
        let zParamValue = [];
        let zResult = {};
        const zTime = parseInt(Date.now()/1000);
        const zCK = await ctx.helper.checkIdOk("ctw_order", pParam.id);

        //验证空值
        if(!pParam.type){ return {code:-1, msg:'打款/收款类型不能为空'}; }
        if(!pParam.id){ return {code:-1, msg:'订单id不能为空'}; }
        if(!pParam.pwd2){ return {code:1020, msg:'交易密码不能为空'}; }
        if(zCK){ return zCK }

        //验证交易密码
        let zUserSqlList = await this.app.mysql.get('db1').query(`select * from ctw_user where id=${zTokenInfo.id}`);
        if(zUserSqlList && zUserSqlList[0]){
            if (ctx.helper.md5(pParam.pwd2, zUserSqlList[0].salt2) === zUserSqlList[0].pwd2){
                console.log("orderEdit 验证交易密码成功 ---------");
            }else{
                return {code:1019, msg:ReturnCode[1019]};
            }
        }else{
            return {code:-1, msg:`用户为空，user_id:${zTokenInfo.id}`};
        }

        //操作ctw_order库
        switch(parseInt(pParam.type)){
            case 1://打款
                zSql = `update ctw_order set status=1, pay_time=?, update_time=? where id=? and from_id=? and status=0`;
                zParamValue = [zTime, zTime, pParam.id, zTokenInfo.id];
                break;
            case 2://确认收款
                zSql = `update ctw_order set status=2, confirm_time=?, update_time=? where id=? and to_id=? and status=1`;
                zParamValue = [zTime, zTime, pParam.id, zTokenInfo.id];
                break;
            case 3://拒绝
                zSql = `update ctw_order set status=3, reason_refuse='?', refuse_time=?, update_time=? where id=? and to_id=?`;
                zParamValue = [pParam.reason, zTime, zTime, pParam.id, zTokenInfo.id];
                break;
            case 4://申诉
                zSql = `update ctw_order set status=4, reason_appeal='?', appeal_time=?, update_time=? where id=? and from_id=?`;
                zParamValue = [pParam.reason, zTime, zTime, pParam.id, zTokenInfo.id];
                break;
            default:
                return {code:-1, msg:`操作类型错误，type:${pParam.type}`};
                break;
        }

        // console.log("zSql:",zSql);
        zResult = await this.app.mysql.get('db1').query(zSql, zParamValue);
        if(zResult && zResult["affectedRows"]>0){
            //确认收款
            if(parseInt(pParam.type)==2){
                await ctx.service.mJudge.orderOkJudge(pParam.id);
            }
            return {code:1, msg:'success', data:pParam, result:zResult};
        }else{
            console.log('data为空，操作失败', zSql);
            return {code:-1, msg:'data为空，操作失败'};
        }
    }
    
    //生成订单
    //@pUserId      pUserId
    //@pRounds      轮数
    //@pOrderType   订单类型（1.天使轮打款  2.公排boss1打款  3.公排boss2打款  4.公排销毁打款(暂时弃用)  5.公排公共账号打款  6.大转盘收款  7.回馈收款  8.动态奖金）
    //@pDynMoney    动态奖金/大转盘奖金
    //@pActiveId    天使轮打款激活的账号的id
    async genOrder(pUserId, pRounds, pOrderType, pDynMoney, pActiveId) {
        const { ctx } = this;
        
        let zCurRounds = pRounds;
        let zUserInfo = await ctx.service.mUser.getUserInfo(pUserId);
        
        //配置信息
        let zConfigDic = await this.ctx.helper.getConfigDic();
        let zConfRateSys = parseFloat(zConfigDic["rate_sys"]);
        let zConfRateBoss1 = parseFloat(zConfigDic["rate_boss1"]);
        let zConfRateBoss2 = parseFloat(zConfigDic["rate_boss2"]);
        let zConfBackMoney = Number(zConfigDic["angle_back_money"]);
        let zConfRateDyn = parseFloat(zConfigDic["rate_dyn"]);
        let zConfDynNum = parseInt(zConfigDic["dyn_num"]);
        let zCurPayMoney = Number(zConfigDic["money_"+zCurRounds]);
        let zDelAddr = zConfigDic["del_addr"];

        //当前汇率
        let zExchange = await ctx.helper.getCurExchange();

        //随机生成公共地址
        let zGgAddrList = await this.app.mysql.get('db1').query(`select * from ctw_gg_addr where is_use=1`);
        if(!zGgAddrList || !zGgAddrList[0]){
            ctx.logger.info(`公共订单添加失败, 公共地址为空，轮数=${zUserInfo.rounds}, fromId=${zUserInfo.id}`);
            return;
        }
        let zGgAddr = zGgAddrList[Math.round(Math.random()*(zGgAddrList.length-1))].addr;

        ////////// 给本公排队列生成相应的单子 //////////
        let zOrderParamList = [];
        if(pOrderType==6){ ////////////// 大转盘奖励
            let zOrderParam_lotto = {};
            zOrderParam_lotto["order_type"] = 6;
            zOrderParam_lotto["fromId"] = 0;
            zOrderParam_lotto["toId"] = zUserInfo.id;
            zOrderParam_lotto["sys_addr"] = zGgAddr;
            zOrderParam_lotto["lock_addr"] = "";
            zOrderParam_lotto["rounds"] = 1;
            zOrderParam_lotto["money"] = pDynMoney;
            zOrderParam_lotto["money_agc"] = pDynMoney*zExchange;
            zOrderParam_lotto["active_id"] = 0;
            zOrderParam_lotto["is_rmb"] = 0;
            zOrderParam_lotto["is_use"] = 1;
            zOrderParamList.push(zOrderParam_lotto);
        }else if(pOrderType==7){ ////////////// 排单收款
            let zOrderParam_backe = {};
            zOrderParam_backe["order_type"] = 7;
            zOrderParam_backe["user_id"] = zUserInfo.id;
            zOrderParamList.push(zOrderParam_backe);
        }else if(pOrderType==8){ ////////////// 动态奖金
            let zOrderParam_dyn = {};
            zOrderParam_dyn["order_type"] = 8;
            zOrderParam_dyn["fromId"] = 0;
            zOrderParam_dyn["toId"] = zUserInfo.id;
            zOrderParam_dyn["sys_addr"] = zGgAddr;
            zOrderParam_dyn["lock_addr"] = "";
            zOrderParam_dyn["rounds"] = zUserInfo.rounds;
            zOrderParam_dyn["money"] = pDynMoney;
            zOrderParam_dyn["money_agc"] = pDynMoney*zExchange;
            zOrderParam_dyn["active_id"] = 0;
            zOrderParam_dyn["is_rmb"] = 0;
            zOrderParam_dyn["is_use"] = 1;
            zOrderParamList.push(zOrderParam_dyn);
        }else{
            if(zCurRounds==0){ ////////////// 天使轮排
                let zOrderParam_angle = {};
                zOrderParam_angle["order_type"] = 1;
                zOrderParam_angle["fromId"] = zUserInfo.id;
                zOrderParam_angle["toId"] = -99;
                zOrderParam_angle["sys_addr"] = "";
                zOrderParam_angle["lock_addr"] = "";
                zOrderParam_angle["rounds"] = 0;
                zOrderParam_angle["money"] = zCurPayMoney;
                zOrderParam_angle["money_agc"] = -1;
                zOrderParam_angle["active_id"] = pActiveId;
                zOrderParam_angle["is_rmb"] = 1;
                zOrderParam_angle["is_use"] = 1;
                zOrderParamList.push(zOrderParam_angle);
            }else{ ///////////// 公排
                let zRoundsUserInfo = await ctx.service.mUser.getRoundsUserInfo(zUserInfo.id, zCurRounds);
                if(!zRoundsUserInfo){
                    ctx.logger.error(`获取getRoundsUserInfo错误！！ zUserInfo=${zUserInfo.id}, zCurRounds=${zCurRounds}`);
                    return;
                }
                let zUserInfoBoss_1 = await ctx.service.mUser.getUserInfo(zRoundsUserInfo.boss_1_id);
                let zUserInfoBoss_2 = await ctx.service.mUser.getUserInfo(zRoundsUserInfo.boss_2_id);

                //boss_1
                if(zUserInfoBoss_1){
                    let zOrderParam_boss_1 = {};
                    zOrderParam_boss_1["order_type"] = 2;
                    zOrderParam_boss_1["fromId"] = zUserInfo.id;
                    zOrderParam_boss_1["toId"] = zUserInfoBoss_1.id;
                    zOrderParam_boss_1["sys_addr"] = "";
                    zOrderParam_boss_1["lock_addr"] = "";
                    zOrderParam_boss_1["rounds"] = zCurRounds;
                    zOrderParam_boss_1["money"] = zConfRateBoss1*zCurPayMoney;
                    zOrderParam_boss_1["money_agc"] = zConfRateBoss1*zCurPayMoney*zExchange;
                    zOrderParam_boss_1["active_id"] = 0;
                    let zIsCanSee_1 = 0;
                    if(zUserInfoBoss_1.rounds>zCurRounds){ zIsCanSee_1=1 };
                    if(zUserInfoBoss_1.rounds==zCurRounds && zUserInfoBoss_1.status==1){ zIsCanSee_1=1 };
                    zOrderParam_boss_1["is_use"] = zIsCanSee_1; //////////////////////////////////
                    zOrderParam_boss_1["is_rmb"] = 0;
                    zOrderParamList.push(zOrderParam_boss_1);
                }
                
                //boss_2
                if(zUserInfoBoss_2){
                    let zOrderParam_boss_2 = {};
                    zOrderParam_boss_2["order_type"] = 3;
                    zOrderParam_boss_2["fromId"] = zUserInfo.id;
                    zOrderParam_boss_2["toId"] = zUserInfoBoss_2.id;
                    zOrderParam_boss_2["sys_addr"] = "";
                    zOrderParam_boss_2["lock_addr"] = "";
                    zOrderParam_boss_2["rounds"] = zCurRounds;
                    zOrderParam_boss_2["money"] = zConfRateBoss2*zCurPayMoney;
                    zOrderParam_boss_2["money_agc"] = zConfRateBoss2*zCurPayMoney*zExchange;
                    zOrderParam_boss_2["active_id"] = 0;
                    let zIsCanSee_2 = 0;
                    if(zOrderParam_boss_2.rounds>zCurRounds){ zIsCanSee_2=1 };
                    if(zOrderParam_boss_2.rounds==zCurRounds && zOrderParam_boss_2.status==1){ zIsCanSee_2=1 };
                    zOrderParam_boss_2["is_use"] = zIsCanSee_2; //////////////////////////////////
                    zOrderParam_boss_2["is_rmb"] = 0;
                    zOrderParamList.push(zOrderParam_boss_2);
                }

                //公共账号
                let zOrderParam_sys = {};
                zOrderParam_sys["order_type"] = 5;
                zOrderParam_sys["fromId"] = zUserInfo.id;
                zOrderParam_sys["toId"] = 0;
                zOrderParam_sys["sys_addr"] = zGgAddr;
                zOrderParam_sys["lock_addr"] = "";
                zOrderParam_sys["rounds"] = zCurRounds;
                zOrderParam_sys["money"] = zConfRateSys*zCurPayMoney;
                zOrderParam_sys["money_agc"] = zConfRateSys*zCurPayMoney*zExchange;
                zOrderParam_sys["active_id"] = 0;
                zOrderParam_sys["is_use"] = 1;
                zOrderParam_sys["is_rmb"] = 0;
                zOrderParamList.push(zOrderParam_sys);
            }
        }

        //生成新单子
        for(let i=0; i<zOrderParamList.length; i++){
            let zInfo = zOrderParamList[i];
            let zTime = parseInt(Date.now()/1000);
            if(zInfo.order_type==7){
                let zParam = ` ${zInfo.user_id}, ${zTime}, ${zTime} `;
                let zSql = `insert into ctw_order_pd (user_id, create_time, update_time) values (${zParam})`;
                let zResult = await this.app.mysql.get('db1').query(zSql);
                if(zResult && zResult["affectedRows"]>0){
                    console.log(`订单回馈订单添加成功, user_id=${zInfo.user_id}`);
                }else{
                    ctx.logger.info(`订单回馈订单添加失败, user_id=${zInfo.user_id}`);
                }
            }else{
                if(zInfo.is_use==0){
                    zTime = parseInt(new Date(2095,1,1,0,0,0).getTime()/1000);
                }
                let zParam = ` ${zInfo.order_type}, ${zInfo.fromId}, ${zInfo.toId},  ${zInfo.money}, ${zInfo.money_agc}, ${zInfo.rounds}, ${zInfo.active_id}, ${zInfo.is_use}, ${zInfo.is_rmb}, '${zInfo.sys_addr}', '${zInfo.lock_addr}', ${zTime}, ${zTime} `;
                let zSql = `insert into ctw_order (order_type, from_id, to_id, money, money_agc, rounds, active_id, is_use, is_rmb, sys_addr, lock_addr, create_time, update_time) values (${zParam})`;
                let zResult = await this.app.mysql.get('db1').query(zSql);
                if(zResult && zResult["affectedRows"]>0){
                    console.log(`订单添加成功, 轮数=${zInfo.rounds}, fromId=${zInfo.fromId}, toId=${zInfo.toId}`);
                }else{
                    ctx.logger.info(`订单添加失败, 轮数=${zInfo.rounds}, fromId=${zInfo.fromId}, toId=${zInfo.toId}`);
                }
            }
        }
        return true;
    }
    
}
module.exports = MBaseService;
