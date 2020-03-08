'use strict';

//o本地：eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAsIm5hbWUiOiJvIiwiYm9zc19pZCI6MCwiYm9zc19pZF8yIjowLCJpc19zcGVjaWFsIjowLCJhY2NvdW50IjoibyIsImlhdCI6MTU4MzU2NzE0OCwiZXhwIjoxNTg0MTcxOTQ4fQ.6_FLZ8BL_cQ8vBRfySxABN2MMBFOHA_46he3pKvZ4PA

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
