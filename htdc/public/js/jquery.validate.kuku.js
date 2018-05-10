/**
 * Created by genghaibin on 2016/9/27 0027.
 */
// 货币数值检查验证
jQuery.validator.addMethod("money", function (value, element) {
	var num = /^\d+(\.[\d]{1,2})?$/;
	return (this.optional(element) || num.test(value));
}, "请输入正确的价格");

// 提成比例验证(0.05-0.2)
jQuery.validator.addMethod("commission", function (value, element) {
	var num = /(^[0]([.][2])?$)|(^[0]([.][2][0])?$)|(^[0]([.][1][0-9])?$)|(^[0]([.][1])?$)|(^0([.]0[5-9])?$)/;
	return (this.optional(element) || num.test(value));
}, "请输入正确的提成比例");

// 电话号码校验(手机号或电话号)
jQuery.validator.addMethod("telOrMobile", function (value, element) {
	var num = /^((\d{11})|^((\d{7,8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1}))$)$/;
	return (this.optional(element) || num.test(value));
}, "请输入正确的电话号码格式");