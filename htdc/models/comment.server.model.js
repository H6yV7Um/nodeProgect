/**
 * 评论表Schema
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var CommentSchema = new mongoose.Schema({
    circleId:String,               //帖子id
    circleOwnerId:String,         //发布帖子人userid
    commentUserId:String,         //发布一级评论的userid
    commentId:String,             //一级评论的id
    type:String,                   //类型，1一级评论2二级评论
    userId:String,                   //用户id
    txyId:String,                    //腾讯云id
    circleContent:String,          //动态内容
    firstComment:String,           //一级评论的内容
    content:String,                 //内容
    nextComment:Array(),           //一级评论下的二级评论最多两条
    isread:Number,                //1已读0未读
    createTime:Number,             //评论时间
});
mongoose.model('Comment', CommentSchema);