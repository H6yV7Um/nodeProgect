/**
 * 后台用户表
 * Mysql模型
 */
module.exports = function (db) {
    return db.define('factor',{
        id:{type: 'serial', key: true},
        factor:{type: 'integer'},                                //计算因子
    });
};

