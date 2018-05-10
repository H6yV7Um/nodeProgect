/**
 * banner广告信息表
 * Mysql模型
 */
module.exports = function (db) {
	return db.define('linkxian_bannerads',{
		id:{type: 'serial', key: true},
		sequence:{type: 'integer'},                         //排列顺序
		pic_url:{type: 'text'},                             //图片地址
		ad_url:{type: 'text'},                              //广告地址
		create_time:{type: 'integer'},                      //创建时间
	});
};

