/**
 * 后台井组表
 * Mysql模型
 */
module.exports = function (db) {
    return db.define('wellGroupData',{
        id:{type: 'serial', key: true},
        wellGroupId:{type: 'integer'},             //井组Id
        singleAmount:{type: 'integer'},          //井组单量
        arteryWaterContent:{type: 'integer'},    //干线含水
        pressure:{type: 'integer'},              //井组回压
        position:{type: 'integer'},              //罐位
        userName:{type: 'text'},                    //用户名
        createTime:{type: 'integer'}               //创建时间
    });
};

