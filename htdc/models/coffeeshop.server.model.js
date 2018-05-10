/**
 * 初心创咖分店表Schema
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var CoffeeshopSchema = new mongoose.Schema({
    shopName:String,
    createTime:Number,             //发布时间
});
mongoose.model('Coffeeshop', CoffeeshopSchema);