/**
 * 小程序session处理中间件
 */
const co = require('co');
const { headers, errors } = require('./constants');
const makeStore = require('./lib/makeStore');
const sha1 = require('./lib/sha1');
const wrapError = require('./lib/wrapError');
const jscode2session = require('./lib/jscode2session');
var config = require("../config");
var redisPrefix = require("../redisPrefix");

let store;

const handler = co.wrap(function *(req, res, next) {
	req.$wxUserInfo = null;

	let code = String(req.header(headers.WX_CODE) || '');
	let rawData = String(req.header(headers.WX_RAW_DATA) || '');
	let signature = String(req.header(headers.WX_SIGNATURE) || '');
	/*console.log("*****************************************");
	console.log("code的值:");
	console.log(code);
	console.log(JSON.stringify(code));
	console.log("rawData的值:");
	console.log(rawData);
	console.log("signature的值:");
	console.log(signature);*/

	let wxUserInfo, sessionKey, expiresIn, openId;
	if (!code) {
		/*console.log("code的值无:");
		console.log(code);*/
		return next();
	}

	// 1、`code` not passed

	// 2、`rawData` not passed
	if (!rawData) {
		//console.log("rawData为空     ======================7");
		try {
			wxUserInfo = yield store.get(redisPrefix.WX_CODE + code);
		} catch (error) {
			/*console.log("出错了:===============================1");
			console.log(error);*/
			return next(error);
		}

		if (!wxUserInfo) {
			let error = new Error('`wxUserInfo` not found by `code`');
			/*console.log("出错了:===============================99");
			console.log(error);
			console.log(wrapError(error, { reason: errors.ERR_SESSION_EXPIRED }));*/
			return res.json(wrapError(error, { reason: errors.ERR_SESSION_EXPIRED }));
		}
		/*console.log("wxUserInfo:");
		console.log(wxUserInfo);*/
		req.$wxUserInfo = wxUserInfo;
		return next();
	}

	// 3、both `code` and `rawData` passed
	try {
		rawData = decodeURIComponent(rawData);
		wxUserInfo = JSON.parse(rawData);
		/*console.log("执行之后:===============================5");
		console.log(wxUserInfo);*/
	} catch (error) {
		/*console.log("出错了:===============================5");
		console.log(error);*/
		return res.json(wrapError(error));
	}



	try {
		/*console.log("准备获取sessionKey了");*/
		({ sessionKey, expiresIn, openId } = yield jscode2session.exchange(code));
		/*console.log({ sessionKey,expiresIn, openId });*/
	} catch (error) {
		/*console.log("出错了:===============================2");
		console.log(error);*/
		return res.json(wrapError(error, { reason: errors.ERR_SESSION_KEY_EXCHANGE_FAILED }));
	}



	// check signature
	if (sha1(rawData + sessionKey) !== signature) {
		let error = new Error('untrusted raw data');
		/*console.log("出错了:===============================3");
		console.log(error);*/
		return res.json(wrapError(error, { reason: errors.ERR_UNTRUSTED_RAW_DATA }));
	}


	/*保存数据*/
	try {
		wxUserInfo.openId = openId;
		expiresIn = expiresIn ? expiresIn : 7200;
		yield store.set(redisPrefix.WX_CODE+code, wxUserInfo, expiresIn);              //ttl为7118秒,接近7200秒(sessionKey过期时间)
		yield store.set(redisPrefix.WX_USERINFO+openId, wxUserInfo, 86400);                         //ttl为30天
		yield store.set(redisPrefix.WX_SESSION_KEY+openId, sessionKey, expiresIn);                        //ttl为7118秒,接近7200秒(sessionKey过期时间)

		req.$wxUserInfo = wxUserInfo;
		return next();

	} catch (error) {
		/*console.log("出错了:===============================4");
		console.log(error);*/
		return next(error);
	}

});

module.exports = (options = {}) => {
	if (!store) {
		store = makeStore(config.redisConfig);
		return handler;
	}

	throw new Error('weapp-session can only be called once.');
};