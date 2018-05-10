/**
 * 后台用户表
 * Mysql模型
 */
module.exports = function (db) {
    return db.define('linkxian_user',{
        id:{type: 'serial', key: true},
        username:{type: 'text'},                                //用户名
        salt:{type: 'text'},                            //盐
        password:{type: 'text'},                             //密码
        create_time:{type: 'integer'},                      //创建时间
    });
};

