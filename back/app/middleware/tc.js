'use strict';

module.exports = options => {
    return async function tc(ctx, next) {
        try{
            await next();
        }catch(error){
            ctx.logger.error("=----=-=-=-=- tc catch Error =-=-==-=-=-=-=-=-=-=");
            ctx.logger.error(error);
            let zErrorMessage = error.message;
            let zShowMessage = "操作失败";
            if(zErrorMessage.indexOf("ER_DUP_ENTRY: Duplicate entry") != -1){
                zShowMessage = zErrorMessage.replace("ER_DUP_ENTRY: Duplicate entry", "操作失败，因为存在相同的值：");
                zShowMessage = zShowMessage.replace("for key", " ；存在相同值的属性为：");
                ctx.body = { code: 1016, msg:zShowMessage, message:zErrorMessage, stack:error.stack};
                return;
            }
            ctx.body = { code: 1000, msg:zShowMessage, message:zErrorMessage, stack:error.stack};
        }
    }
}