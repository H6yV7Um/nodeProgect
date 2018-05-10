/**
 * redis缓存服务数据Key值前缀
 */
module.exports = {
	WX_CODE:'WX_CODE_',                         //存储code值,key值格式:"WX_CODE_"+code值.value值为wx.getUserInfo()得到的用户信息.ttl为2小时
	WX_USERINFO:'WX_USERINFO_',                     //存储用户信息,key值格式:"WX_USERINFO_"+openid值.value值为wx.getUserInfo()得到的用户信息.ttl为24小时
	WX_SESSION_KEY:'WX_SESSION_KEY_',           //存储用户sessionKey信息,key值格式:"WX_SESSION_KEY_"+openid值.value值为jscode2session得到的sessionKey信息.ttl为5分钟
	FLOCK_HOME_DATA_BY_OPEN_GROUP_ID:'FLOCK_HOME_DATA_BY_OPEN_GROUP_ID_',//存储群首页信息，key值格式:"FLOCK_HOME_DATA_BY_OPEN_GROUP_ID_"+openGId值.value值为群首页所需信息.ttl永久
	WX_ACCESS_TOKEN:'WX_ACCESS_TOKEN',              //微信使用API的access_token
}