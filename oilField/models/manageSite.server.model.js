/**
 * 后台站点表
 * Mysql模型
 */
module.exports = function (db) {
    return db.define('manageSite',{
        id:{type: 'serial', key: true},
        name:{type: 'text'},                    //站点名
        createTime:{type: 'integer'}               //创建时间
    });
};

