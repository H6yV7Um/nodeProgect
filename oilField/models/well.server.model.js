/**
 * 后台单井表
 * Mysql模型
 */
module.exports = function (db) {
    return db.define('well',{
        id:{type: 'serial', key: true},
        wellName:{type: 'text'},          //单井名
        diagrams:{type: 'text'},          //功图工况
        oilData:{type: 'text'},           //功图量油数据
        createTime:{type: 'integer'}               //创建时间
    });
};

