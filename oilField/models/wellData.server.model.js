/**
 * 后台单井表
 * Mysql模型
 */
module.exports = function (db) {
    return db.define('wellData',{
        id:{type: 'serial', key: true},
        wellId:{type: 'integer'},          //单井ID
        liquidLevel:{type: 'integer'},       //液面
        waterContent:{type: 'integer'},      //含水
        wellPressure:{type: 'integer'},      //井口压力
        wellTime:{type: 'integer'},          //开井时间
        userName:{type: 'text'},                    //用户名
        createTime:{type: 'integer'}               //创建时间
    });
};

