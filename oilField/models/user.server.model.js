/**
 * 后台用户表
 * Mysql模型
 */
module.exports = function (db) {
    return db.define('user',{
        id:{type: 'serial', key: true},
        username:{type: 'text'},                                //用户名
        password:{type: 'text'},                             //密码
        phone:{type: 'integer'},                             //用户电话
        roleId:{type: 'integer'},                             //用户角色id 1超级管理员2管理员3站点管理员4井组管理员5单井管理员
        jurisdiction:{type: 'text'},                      //创建时间
        createTime:{type: 'integer'},                      //创建时间
    });
};

