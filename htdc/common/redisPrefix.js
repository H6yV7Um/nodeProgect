/**
 * redis缓存服务数据Key值前缀
 */
module.exports = {
    USERS_NUM:'USERS_NUM',                         //存储code值,key值格式:"WX_CODE_"+code值.用户统计数量
    PAGE_NUM:'PAGE_NUM',                           //访问页面统计数据
    CIRCLE_NUM:'CIRCLE_NUM',                       //发布动态统计数据
}