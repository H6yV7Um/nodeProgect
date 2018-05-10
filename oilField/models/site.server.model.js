/**
 * 后台站点表
 * Mysql模型
 */
module.exports = function (db) {
    return db.define('site',{
        id:{type: 'serial', key: true},
        siteName:{type: 'text'},                    //站点名
        standard:{type: 'integer'},                 //罐标
        manageId:{type: 'integer'},                 //管理站Id
        createTime:{type: 'integer'}               //创建时间
    });
};

