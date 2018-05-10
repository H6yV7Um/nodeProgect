/**
 * 健身教练表Schema
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var GymcoachSchema = new mongoose.Schema({
    gymcoachName:String,                  //教练名字
    gymcoachPhone:String,              //教练电话
    greatTerritory:String,            //擅长领域
    price1:Number,                  //入驻企业有期权价格
    price2:Number,              //入驻企业无期权价格
    price3:Number,            //普通用户价格
    startTime:Number,                //工作开始时间
    endTime:Number,                 //工作结束时间
    price:Number,                   //价格
    gymcoachPic:String,            //教练图片
    createTime:Number,             //创建时间
});
mongoose.model('Gymcoach', GymcoachSchema);