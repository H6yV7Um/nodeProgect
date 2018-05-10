/**
 * 话题表
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var TopicSchema = new mongoose.Schema({
    interspaceId:String,   //空间id
    topicId:String,   //话题id
    isSource:Number,   //是否是发起的新话题
    userId:String,
    title:String,    //标题
    topicInfo:String,   //话题简介
    imgArr:Array,        //图片
    member:Array,     // 成员
    commentNum:{type:Number,default:0}, //评论数
    goodNum:{type:Number,default:0},   //点赞数
    goodUserids:Array,     //点赞
    isDelete:Number,  //是否解散群
    topicNum:{type:Number,default:0},  //话题数量
    createTime:{type:Number,default:Date.now()},
});
mongoose.model('Topic', TopicSchema);