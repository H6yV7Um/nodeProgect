/**
 * 异业营销置换信息表
 * Mysql模型
 */
module.exports = function (db) {
	return db.define('linkxian_marketing',{
		id:{type: 'serial', key: true},
		type:{type: 'text'},                                //品类
		shopname:{type: 'text'},                            //店名
		address:{type: 'text'},                             //地址
		latitude:{type: 'number'},                          //纬度
		longitude:{type: 'number'},                         //经度
		phone:{type: 'text'},                               //电话
		exchange_intention:{type: 'text'},                  //置换意向
		picurl:{type: 'text'},                              //图片
		start_time:{type: 'integer'},                       //开始时间
		end_time:{type: 'integer'},                         //结束时间
		status:{type: 'integer'},                           //状态。0未审批；1审批通过
		create_time:{type: 'integer'},                      //创建时间
	});
};

