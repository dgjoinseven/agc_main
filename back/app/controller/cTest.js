'use strict';

const Controller = require('egg').Controller;

class CTestController extends Controller {

    //创建用户
    async createUser() {
        var zData = await this.ctx.service.mTest.createUser(this.ctx.request.body);
        if(zData){this.ctx.body = zData;}else{this.ctx.body = { code:-1, msg:'error'};}
    }

    //创建公排用户
    async createRound() {
        var zData = await this.ctx.service.mTest.createRound(this.ctx.request.body);
        if(zData){this.ctx.body = zData;}else{this.ctx.body = { code:-1, msg:'error'};}
    }

    //创建订单
    async createOrder() {
        var zData = await this.ctx.service.mTest.createOrder(this.ctx.request.body);
        if(zData){this.ctx.body = zData;}else{this.ctx.body = { code:-1, msg:'error'};}
    }

}

module.exports = CTestController;
