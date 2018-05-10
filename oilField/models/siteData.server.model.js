/**
 * 后台站点表
 * Mysql模型
 */
module.exports = function (db) {
    return db.define('siteData',{
        id:{type: 'serial', key: true},
        siteId:{type: 'integer'},                    //站点id
        throughput:{type: 'integer'},               //外输量
        position:{type: 'integer'},                 //罐位
        oilTransfer:{type: 'integer'},              //卸油台转油量
        waterContent:{type: 'integer'},             //卸油含水
        liquidAmount:{type: 'integer'},             //卸液量
        sprayAmount:{type: 'integer'},              //接喷量
        dose:{type: 'integer'},                     //扫线量
        userName:{type: 'text'},                    //用户名
        createTime:{type: 'integer'}               //创建时间
    });
};

