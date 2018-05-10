/**
 * 后台用户表
 * Mysql模型
 */
module.exports = function (db) {
    return db.define('role',{
        id:{type: 'serial', key: true},
        roleName:{type: 'text'}                             //用户角色 1超级管理员2管理员3站点管理员4井组管理员5单井管理员
    });
};

