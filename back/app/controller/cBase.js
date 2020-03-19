'use strict';

const Controller = require('egg').Controller;

class CBaseController extends Controller {

    //汇率列表
    async exchangeList() {
        var zData = await this.ctx.service.mBase.exchangeList(this.ctx.query);
        if(zData){this.ctx.body = zData ;}else{this.ctx.body = { code:-1, msg:'error'};}
    }

    //分红池列表
    async fhPooList() {
        var zData = await this.ctx.service.mBase.fhPooList(this.ctx.query);
        if(zData){this.ctx.body = zData ;}else{this.ctx.body = { code:-1, msg:'error'};}
    }
    

    //乐透开奖
    async lottoStart() {
        var zData = await this.ctx.service.mBase.lottoStart(this.ctx.query);
        if(zData){this.ctx.body = zData ;}else{this.ctx.body = { code:-1, msg:'error'};}
    }

    //团队列表
    async groupList() {
        var zData = await this.ctx.service.mBase.groupList(this.ctx.query);
        if(zData){this.ctx.body = zData ;}else{this.ctx.body = { code:-1, msg:'error'};}
    }

    //公告列表
    async noticeList() {
        var zData = await this.ctx.service.mBase.noticeList(this.ctx.query);
        if(zData){this.ctx.body = zData ;}else{this.ctx.body = { code:-1, msg:'error'};}
    }

    //评论列表
    async commentList() {
        var zData = await this.ctx.service.mBase.commentList(this.ctx.query);
        if(zData){this.ctx.body = zData ;}else{this.ctx.body = { code:-1, msg:'error'};}
    }

    //评论编辑
    async commentEdit() {
        var zData = await this.ctx.service.mBase.commentEdit(this.ctx.request.body);
        if(zData){this.ctx.body = zData;}else{this.ctx.body = { code:-1, msg:'error'};}
    }

    //QA列表
    async qaList() {
        var zData = await this.ctx.service.mBase.qaList(this.ctx.query);
        if(zData){this.ctx.body = zData ;}else{this.ctx.body = { code:-1, msg:'error'};}
    }

    //QA编辑（添加）
    async qaEdit() {
        var zData = await this.ctx.service.mBase.qaEdit(this.ctx.request.body);
        if(zData){this.ctx.body = zData;}else{this.ctx.body = { code:-1, msg:'error'};}
    }

    //QA列表
    async qaList() {
        var zData = await this.ctx.service.mBase.qaList(this.ctx.query);
        if(zData){this.ctx.body = zData ;}else{this.ctx.body = { code:-1, msg:'error'};}
    }

    //集市-加持
    async marketJcList() {
        var zData = await this.ctx.service.mBase.marketJcList(this.ctx.query);
        if(zData){this.ctx.body = zData ;}else{this.ctx.body = { code:-1, msg:'error'};}
    }

    //集市-邀请挂靠点
    async marketInvitationList() {
        var zData = await this.ctx.service.mBase.marketInvitationList(this.ctx.query);
        if(zData){this.ctx.body = zData ;}else{this.ctx.body = { code:-1, msg:'error'};}
    }

    //用户详情
    async userDetail() {
        var zData = await this.ctx.service.mBase.userDetail(this.ctx.query);
        if(zData){this.ctx.body = zData ;}else{this.ctx.body = { code:-1, msg:'error'};}
    }

    //用户升级
    async userLevleUp() {
        var zData = await this.ctx.service.mBase.userLevleUp(this.ctx.request.body);
        if(zData){this.ctx.body = zData;}else{this.ctx.body = { code:-1, msg:'error'};}
    }

    //账号编辑
    async userEdit() {
        var zData = await this.ctx.service.mBase.userEdit(this.ctx.request.body);
        if(zData){this.ctx.body = zData;}else{this.ctx.body = { code:-1, msg:'error'};}
    }
    
    //加持列表
    async jcList() {
        var zData = await this.ctx.service.mBase.jcList(this.ctx.query);
        if(zData){this.ctx.body = zData ;}else{this.ctx.body = { code:-1, msg:'error'};}
    }

    //加持谁
    async jcWho() {
        var zData = await this.ctx.service.mBase.jcWho(this.ctx.request.body);
        if(zData){this.ctx.body = zData;}else{this.ctx.body = { code:-1, msg:'error'};}
    }

    //订单列表
    async orderList() {
        var zData = await this.ctx.service.mBase.orderList(this.ctx.query);
        if(zData){this.ctx.body = zData ;}else{this.ctx.body = { code:-1, msg:'error'};}
    }

    //设置信息
    async orderSetInfo() {
        var zData = await this.ctx.service.mBase.orderSetInfo(this.ctx.request.body);
        if(zData){this.ctx.body = zData;}else{this.ctx.body = { code:-1, msg:'error'};}
    }

    //订单编辑
    async orderEdit() {
        var zData = await this.ctx.service.mBase.orderEdit(this.ctx.request.body);
        if(zData){this.ctx.body = zData;}else{this.ctx.body = { code:-1, msg:'error'};}
    }

    //动态奖金列表
    async dynList() {
        var zData = await this.ctx.service.mDyn.dynList(this.ctx.query);
        if(zData){this.ctx.body = zData ;}else{this.ctx.body = { code:-1, msg:'error'};}
    }
    
    //动态奖金记录列表
    async dynLogList() {
        var zData = await this.ctx.service.mDyn.dynLogList(this.ctx.query);
        if(zData){this.ctx.body = zData ;}else{this.ctx.body = { code:-1, msg:'error'};}
    }

    

    ///////////////////////////////////// 其它 /////////////////////////////////////
    //上传图片
    async uploadImg() {
        var zData = await this.ctx.service.mzUploadFile.uploadImg();
        if(zData){this.ctx.body = zData ;}else{this.ctx.body = { code:-1, msg:'error'};}
    }

    //获取短信验证码
    async smsCode() {
        var zData = await this.ctx.service.mzEmailTel.smsCode(this.ctx.request.body);
        if(zData){this.ctx.body = zData;}else{this.ctx.body = { code:-1, msg:'error'};}
    }

    //忘记密码
    async forgetPwd() {
        var zData = await this.ctx.service.mzEmailTel.forgetPwd(this.ctx.request.body);
        if(zData){this.ctx.body = zData;}else{this.ctx.body = { code:-1, msg:'error'};}
    }

}

module.exports = CBaseController;
