/**
 * 商品表Schema
 */
var mongoose = require("mongoose");
var autoIncrement = require('mongoose-auto-increment');
var Schema = mongoose.Schema;
var GoodsSchema = new mongoose.Schema({
    goodsId:Number,     //商品编号
    goodsOrder:Number,  //商品序号
    shopId:String,      //商品所属店铺id
    userId:String,    //商品所有者userid
    interspaceId:String,    //商品所属空间id
    goodsType:String,   //商品类别1实体性2服务型
    goodsName:String,    //商品名称
    goodsDescribe:String,   //商品描述
    goodsInfo:String,       //商品详情
    goodsPic:String,        //商品展示图
    goodsPic2:String,        //商品展示图（大图）
    goodsImgs:Array,         //商品轮播图
    price1:Number,                  //入驻企业有期权价格
    price2:Number,              //入驻企业无期权价格
    price3:Number,            //普通用户价格
    price4:Number,                   //
    goodsInventory:Number,     //商品库存
    goodsUnit:String,      //商品单位
    goodsClassId:String,//商品分类
    createTime:Number,         //商品添加时间
    monthSaleNum:Number,            //月销售量
    allSaleNum:Number,              //总销售量
    goodsExplain:String,          //服务说明
    type:String,                  //1初心创咖2各空间商品3课程
    useInfo:String,  //使用说明
    teacherId:String,     //所属教师Id
    startTime:Number,
    endTime:Number,
    detailPlace:String,   //课程详细地址
    typeId:String,     //课程体系
    isRecommend:{type:Number,default:0}
    //规格
});

GoodsSchema.plugin(autoIncrement.plugin, {
    model: 'Goods',
    field: 'goodsId',
    startAt: 10000,
    incrementBy: 1
});

mongoose.model('Goods', GoodsSchema);

