const jwt = require('jsonwebtoken')
const config = require('config');


const sign = config.get('sign');

/**
 * 判断token是否可用
 */
module.exports = async ( ctx, next ) => {
    //拿到token
    const authorization = ctx.get('Authorization');
    if (!authorization) {
        ctx.sendError({ code: 401, message: 'No token detected in http headerAuthorization'});
        return;
    }

    try {
        let payload;
        payload = await jwt.verify(authorization, sign);     //如果token过期或验证失败，将抛出错误
        ctx.state.user = {
            user: payload.user,
            id: payload.id
        }
        await next();
    } catch (err) {
        console.error(err);
        ctx.sendError({ code: 401, message: 'Invalid token'});
    }
  
};