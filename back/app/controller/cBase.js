'use strict';

const Controller = require('egg').Controller;

class CBaseController extends Controller {

    //汇率列表
    async exchangeList() {
        var zData = await this.ctx.service.mBase.exchangeList(this.ctx.query);
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

    //冻结用户列表
    async frozenUserList() {
        var zData = await this.ctx.service.mBase.frozenUserList(this.ctx.query);
        if(zData){this.ctx.body = zData ;}else{this.ctx.body = { code:-1, msg:'error'};}
    }

    //冻结用户编辑
    async frozenUserEdit() {
        var zData = await this.ctx.service.mBase.frozenUserEdit(this.ctx.request.body);
        if(zData){this.ctx.body = zData;}else{this.ctx.body = { code:-1, msg:'error'};}
    }
    
    //订单列表
    async orderList() {
        var zData = await this.ctx.service.mBase.orderList(this.ctx.query);
        if(zData){this.ctx.body = zData ;}else{this.ctx.body = { code:-1, msg:'error'};}
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

}

module.exports = CBaseController;
