/**
 * 获得access_token
 */
var redisPrefix = require("../redisPrefix");
var utils = require("./utils");
var wechatApi = require("./wechatApi");

module.exports = function (fn) {

	//根据token从redis中获取access_token
	utils.get(redisPrefix.WX_ACCESS_TOKEN).then(function(data){
		//获取到值--往下传递
		if (data) {
			return Promise.resolve(data);
		}
		//没获取到值--从微信服务器端获取,并往下传递
		else{
			return wechatApi.updateAccessToken();
		}
	}).then(function(data){
		console.log(data);
		//没有expire_in值--此data是redis中获取到的
		if (!data.expires_in) {
			/*console.log('redis获取到值');
			req.accessToken = data;
			next();*/
			fn (null,data);
		}
		//有expire_in值--此data是微信端获取到的
		else{
			//console.log('redis中无值');
			/**
			 * 保存到redis中,由于微信的access_token是7200秒过期,
			 * 存到redis中的数据减少20秒,设置为7180秒过期
			 */
			utils.set(redisPrefix.WX_ACCESS_TOKEN,`${data.access_token}`,7180).then(function(result){
				if (result == 'OK') {
					/*req.accessToken = data.access_token;
					next();*/
					fn(null,data.access_token);
				}else{
					fn("redis err",null);
				}
			})
		}

	})
}