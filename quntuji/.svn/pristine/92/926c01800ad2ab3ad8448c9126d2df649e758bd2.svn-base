/**
 * redis连接
 */
var redis = require("redis");
var config = require("../common/config");

module.exports = redis.createClient({
	host: config.redisConfig.host,
	port: config.redisConfig.port,
	password: config.redisConfig.password
});