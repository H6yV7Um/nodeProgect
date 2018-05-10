/**
 * 附近优惠信息表
 * Mysql模型
 */
module.exports = function (db) {
	return db.define('linkxian_benefit',{
		id:{type: 'serial', key: true},
		type:{type: 'text'},                                //品类
		shopname:{type: 'text'},                            //店名
		address:{type: 'text'},                             //地址
		latitude:{type: 'number'},                          //纬度
		longitude:{type: 'number'},                         //经度
		phone:{type: 'text'},                               //电话
		benefit:{type: 'text'},                             //优惠内容
		picurl:{type: 'text'},                              //图片
		start_time:{type: 'integer'},                       //开始时间
		end_time:{type: 'integer'},                         //结束时间
        shop_sign_picurl:{type: 'text'},                         //店铺门头照片
        show_link_url:{type: 'text'},                         //店铺展示页链接
        link_type:{type: 'integer'},                         //店铺展示页链接类型
		status:{type: 'integer'},                           //状态。0未审批；1审批通过
		create_time:{type: 'integer'},                      //创建时间
	});
};

