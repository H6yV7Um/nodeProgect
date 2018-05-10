/**
 * 后台井组表
 * Mysql模型
 */
module.exports = function (db) {
    return db.define('wellGroup',{
        id:{type: 'serial', key: true},
        wellGroupName:{type: 'text'},         //井组名
        standard:{type: 'integer'},              //罐标
        createTime:{type: 'integer'}               //创建时间
    });
};

