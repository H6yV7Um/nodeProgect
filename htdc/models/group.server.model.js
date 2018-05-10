/**
 * 群组表Schema
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');
var GroupSchema = new mongoose.Schema({
    groupId:String,           //群组id
    memberNumber:Number,      //群成员人数
    createTime:Number,        //建群时间
    order:Number,             //群组排序
    groupName:String,         //群组名
});
GroupSchema.plugin(autoIncrement.plugin, {
    model: 'Group',
    field: 'order',
    startAt: 10000,
    incrementBy: 1
});
mongoose.model('Group', GroupSchema);