'use strict';

//14本地：eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTQsIm5hbWUiOiLnrKxhMWHkuroiLCJib3NzX2lkIjo1LCJpc19zcGVjaWFsIjowLCJhY2NvdW50IjoiYTFhIiwiaWF0IjoxNTc1OTU3Mjc3LCJleHAiOjE1NzY1NjIwNzd9.-_UWQ5DJrqW1Gh94Y-GS7mHpbdT6astzzIBcfod7XZ0
//5本地：eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NzIsIm5hbWUiOiJUZXJyeSIsImJvc3NfaWQiOjUsImlzX3NwZWNpYWwiOjAsImFjY291bnQiOiIyNTEzMzM3MzhAcXEuY29tIiwiaWF0IjoxNTc3MTk0NDEzLCJleHAiOjE1Nzc3OTkyMTN9._1QlHvkEGaeXhvmYKNrNbNsTbx-2xM9oZ9c9Verc9TY
//2本地：eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwibmFtZSI6IuesrGHkuroiLCJib3NzX2lkIjoxLCJpc19zcGVjaWFsIjowLCJhY2NvdW50IjoiYSIsImlhdCI6MTU3NTk2MDc4NSwiZXhwIjoxNTc2NTY1NTg1fQ.cCKr-RNa2VoXKugBcSVIjTUsYIfq736e2ZcAk4BPzmc
//1本地：eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibmFtZSI6IuWOn-Wni-eCuSIsImJvc3NfaWQiOjAsImJvc3NfaWRfMiI6bnVsbCwiaXNfc3BlY2lhbCI6MSwiYWNjb3VudCI6Im8iLCJpYXQiOjE1Nzg5MTc5MjksImV4cCI6MTU3OTUyMjcyOX0.jkm2ybYBVjIqWJI6Hh-pYGVIHU_wk2WEztZFhOoeKJY

//测试：eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTQsIm5hbWUiOiLnrKxhMWHkuroiLCJib3NzX2lkIjo1LCJpc19zcGVjaWFsIjowLCJhY2NvdW50IjoiYTFhIiwiaWF0IjoxNTc1OTU3Mjc3LCJleHAiOjE1NzY1NjIwNzd9.-_UWQ5DJrqW1Gh94Y-GS7mHpbdT6astzzIBcfod7XZ0

module.exports = options => {
    return async function jwt(ctx, next) {
        // const salt = 'Pool ';
        let zAuthToken = ctx.header.authorization; // 获取header里的authorization
        if (zAuthToken) {
            try {
                const zTokenInfo = ctx.helper.verifyToken(zAuthToken);// 解密获取的Token
                // console.log("jwt =========", zTokenInfo);
                if (zTokenInfo && zTokenInfo.account) {
                    let zRedisToken = await ctx.app.redis.get('login_'+zTokenInfo.account);
                    // console.log("zAuthToken: ", zAuthToken);
                    // console.log("jwt 读token: ",  zTokenInfo.account, zRedisToken);
                    if(zAuthToken != zRedisToken){
                        ctx.body = { code: 10001, msg: 'token失效，请登陆后再进行操作' };
                    }else{
                        await next();
                    }
                } else {
                    ctx.body = { code: 10001, msg: '请登陆后再进行操作' };
                }
            }catch (error) {
                ctx.logger.warn(error)
                ctx.body = { code: 10001, msg: '请求文件头authorization解析错误', error:error };
            }
        } else {
            ctx.body = { code: 10001, msg: '缺乏请求文件头authorization' };
        }
    };
};
