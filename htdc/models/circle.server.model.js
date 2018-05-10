/**
 * 大程帮表Schema
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var CircleSchema = new mongoose.Schema({
    userId:String,                   //用户id
    txyId:String,                    //腾讯云id
    interspaceId:String,    //店铺所属空间id
    textContent:String,                 //内容
    imgContent:Array(),                //图片内容
    type:Number,                     //类别1帖子2动态
    title:String,                   //标题
    commentNum:Number,               //评论数
    goodNum:Number,                 //点赞数
    goodUserids:Array,             //点赞人userid
    createTime:Number,             //发布时间
});
mongoose.model('Circle', CircleSchema);