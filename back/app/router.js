'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  const jwt = app.middleware.jwt();
  const tc = app.middleware.tc();

  ////////////////////// 测试模块 //////////////////////
  router.post('/api/test_createUser', tc, controller.cTest.createUser); //创建用户
  router.post('/api/test_createRound', tc, controller.cTest.createRound); //创建公排用户
  router.post('/api/test_createOrder', tc, controller.cTest.createOrder); //创建订单

  ////////////////////// 用户模块 //////////////////////
  // router.post('/api/test', tc, controller.cUser.test); //测试
  router.post('/api/login', tc, controller.cUser.login); //登录
  router.post('/api/logout', jwt, tc, controller.cUser.logout); //登出

  ////////////////////// 基础模块 //////////////////////
  router.get('/api/exchange_list', jwt, tc, controller.cBase.exchangeList); //汇率列表
  router.get('/api/lotto_start', jwt, tc, controller.cBase.lottoStart);     //乐透开奖
  router.get('/api/group_list', jwt, tc, controller.cBase.groupList);       //团队列表
  router.get('/api/notice_list', jwt, tc, controller.cBase.noticeList);     //公告列表
  router.get('/api/comment_list', jwt, tc, controller.cBase.commentList);   //评论列表
  router.post('/api/comment_edit', jwt, tc, controller.cBase.commentEdit);  //评论编辑
  router.get('/api/qa_list', jwt, tc, controller.cBase.qaList);   //问题列表
  router.post('/api/qa_edit', jwt, tc, controller.cBase.qaEdit);  //问题编辑
  router.get('/api/user_detail', jwt, tc, controller.cBase.userDetail);     //用户详情
  router.post('/api/user_lv_up', jwt, tc, controller.cBase.userLevleUp);    //用户升级
  router.post('/api/user_edit', jwt, tc, controller.cBase.userEdit);        //用户编辑
  router.get('/api/order_list', jwt, tc, controller.cBase.orderList);       //订单列表
  router.post('/api/orderSetInfo', jwt, tc, controller.cBase.orderSetInfo);  //订单信息修改
  router.post('/api/order_edit', jwt, tc, controller.cBase.orderEdit);      //订单编辑

  router.get('/api/dyn_list', jwt, tc, controller.cBase.dynList);           //动态奖金列表
  router.get('/api/dyn_log_list', jwt, tc, controller.cBase.dynLogList);    //动态奖金记录列表
  
  router.get('/api/jc_list', jwt, tc, controller.cBase.jcList);     //加持列表
  router.post('/api/jc_who', jwt, tc, controller.cBase.jcWho);      //加持谁
  router.get('/api/market_jc', jwt, tc, controller.cBase.marketJc);   //集市-加持
  router.get('/api/market_invitation', jwt, tc, controller.cBase.marketInvitation);   //集市-推荐

  ////////////////////// 其它 //////////////////////
  router.post('/api/upload_img', tc, controller.cBase.uploadImg); // 上传图片
  // router.get('/getOssAuth', tc, controller.uploader.ossAuth); // 获取上传签名
  // router.post('/updateNotification', tc, controller.cSetup.uploadSingle); // 上传
  
};
