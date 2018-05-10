/*
 *微信相关操作api
 */
var wechatApi = {};
var config = require('../config');
var appID = config.weappConfig.appId;
var appSecret = config.weappConfig.appSecret;
var utils = require('./utils');
var api = {
	accessToken : `${config.weappConfig.prefix}token?grant_type=client_credential`,
	//upload : `${config.weappConfig.prefix}media/upload?`
}

//获取access_token
wechatApi.updateAccessToken = function(){
	var url = `${api.accessToken}&appid=${appID}&secret=${appSecret}`;
	//console.log(url);
	var option = {
		url : url,
		json : true
	};
	return utils.request(option).then(function(data){

		return Promise.resolve(data);
	})
}

module.exports = wechatApi;