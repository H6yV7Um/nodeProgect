/**
 * 评论表Schema
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var TopiccommentSchema = new mongoose.Schema({
    topicId:String,               //话题id
    topicOwnerId:String,         //发布帖子人userid
    topicUserId:String,         //发布一级评论的userid
    commentId:String,             //一级评论的id
    type:Number,                   //类型，1一级评论2二级评论
    userId:String,                   //用户id
    txyId:String,                    //腾讯云id
    firstComment:String,           //一级评论的内容
    content:String,                 //内容
    nextComment:{type:Array,default:[]},           //一级评论下的二级评论最多两条
    isread:Number,                //1已读0未读
    createTime:Number,             //评论时间
});
mongoose.model('Topiccomment', TopiccommentSchema);