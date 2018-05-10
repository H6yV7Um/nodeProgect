/**
 * 后台用户表
 * Mysql模型
 */
module.exports = function (db) {
    return db.define('abnormal',{
        id:{type: 'serial', key: true},
        siteDataId:{type: 'integer'},                               //站点Id
        wellGroupDataId:{type: 'integer'},                          //井组Id
        wellDataId:{type: 'integer'},                               //单井Id
        remark:{type: 'text'},                                  //备注
        createTime:{type: 'integer'}                            //创建时间
    });
};

