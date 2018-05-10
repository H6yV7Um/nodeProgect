/**
 * 辣椒
 * 查询模型
 * {
		fieldName:'library_number',     //字段名，对应数据库中的字段名
		chineseName:'库编号',           //中文名，该字段的中文名
		type:'text',                    //查询类型，有三个类型：text,select,compare
		attach:[]                       //附件条件。当查询类型为text时，此字段无意义；当为select时，此字段为选项数组；当为compare时，此字段为输入区间的最小值、最大值
	}
 */
module.exports = [
	{
		fieldName:'library_number',
		chineseName:'库编号',
		type:'text',
		val:'',
		attach:[]
	},
	{
		fieldName:'uniform_number',
		chineseName:'统一编号',
		type:'text',
		val:'',
		attach:[]
	},
	{
		fieldName:'cultivar_name',
		chineseName:'品种名称',
		type:'text',
		val:'',
		attach:[]
	},
	{
		fieldName:'translation',
		chineseName:'译名',
		type:'text',
		val:'',
		attach:[]
	},
	{
		fieldName:'seed_source',
		chineseName:'种子来源',
		type:'text',
		val:'',
		attach:[]
	},
	{
		fieldName:'preservation_unit',
		chineseName:'保存单位',
		type:'text',
		val:'',
		attach:[]
	},
	{
		fieldName:'save_number',
		chineseName:'保存编号',
		type:'text',
		val:'',
		attach:[]
	},
	{
		fieldName:'growth_stage',
		chineseName:'生育期',
		type:'compare',
		sel:'=',
		val:'',
		attach:[25,270]
	},
	{
		fieldName:'maturity',
		chineseName:'熟性',
		type:'select',
		val:'请选择。。。',
		attach:['晚','早','中']
	},
	{
		fieldName:'plant_height',
		chineseName:'株高',
		type:'compare',
		sel:'=',
		val:'',
		attach:[22,182]
	},
	{
		fieldName:'first_flower_node',
		chineseName:'首花节位',
		type:'compare',
		sel:'=',
		val:'',
		attach:[1,20]
	},
	{
		fieldName:'direction_of_fruit',
		chineseName:'着果方向',
		type:'select',
		val:'请选择。。。',
		attach:['侧生','混生','向上','向上侧生','向下','向下侧生']
	},
	{
		fieldName:'fresh_ripe_fruit',
		chineseName:'食熟果皮色',
		type:'select',
		val:'请选择。。。',
		attach:['黑','黄','绿','紫']
	},
	{
		fieldName:'mature_fruit_color',
		chineseName:'老熟种果色',
		type:'select',
		val:'请选择。。。',
		attach:['红','黄','桔黄','绿','紫']
	},
	{
		fieldName:'fruit_shape',
		chineseName:'果形',
		type:'select',
		val:'请选择。。。',
		attach:['扁圆形','长柱型','方灯笼形','其他','圆形','圆锥形','钟形']
	},
	{
		fieldName:'pulp_thickness',
		chineseName:'果肉厚',
		type:'compare',
		sel:'=',
		val:'',
		attach:[0.1,2]
	},
	{
		fieldName:'thick_skin',
		chineseName:'外皮薄厚',
		type:'select',
		val:'请选择。。。',
		attach:['薄','簿','厚','中']
	},
	{
		fieldName:'single_fruit_weight',
		chineseName:'单果重',
		type:'compare',
		sel:'=',
		val:'',
		attach:[0.2,251]
	},
	{
		fieldName:'fruit_moisture',
		chineseName:'果实水分',
		type:'select',
		val:'请选择。。。',
		attach:['多','高','较多','较少','少','适中','水多','水少','中']
	},
	{
		fieldName:'flavor',
		chineseName:'风味',
		type:'select',
		val:'请选择。。。',
		attach:['不辣','淡','极辣','苦','苦辣','辣甜','酸','酸辣','酸甜','甜','甜辣','微辣','中辣']
	},
	{
		fieldName:'purpose',
		chineseName:'用途',
		type:'select',
		val:'请选择。。。',
		attach:['广泛','生食','生食熟食','生食制干','生食腌制','熟食','熟食制干','熟食腌制','鲜食','制干','制干生食','制干腌制','腌制']
	},
	{
		fieldName:'cultivation_season',
		chineseName:'栽培季节',
		type:'text',
		val:'',
		attach:[]
	},
	{
		fieldName:'per_mu_yield',
		chineseName:'亩产',
		type:'compare',
		sel:'=',
		val:'',
		attach:[88,5000]
	},
	{
		fieldName:'dry_matter',
		chineseName:'干物质',
		type:'compare',
		sel:'=',
		val:'',
		attach:[5.2,29.63]
	},
	{
		fieldName:'vitamin',
		chineseName:'维生素C',
		type:'compare',
		sel:'=',
		val:'',
		attach:[12.9,350.05]
	},
	{
		fieldName:'capsaicin',
		chineseName:'辣椒素',
		type:'compare',
		sel:'=',
		val:'',
		attach:[0.002,1.11]
	},
	{
		fieldName:'stress_resistance',
		chineseName:'抗逆性',
		type:'text',
		val:'',
		attach:[]
	},
	{
		fieldName:'twv_incidence',
		chineseName:'TMV发病率',
		type:'compare',
		sel:'=',
		val:'',
		attach:[0,100]
	},
	{
		fieldName:'twv_disease_index',
		chineseName:'TMV病指',
		type:'text',
		val:'',
		attach:[]
	},
	{
		fieldName:'cmv_incidence',
		chineseName:'CMV发病率',
		type:'compare',
		sel:'=',
		val:'',
		attach:[0,100]
	},
	{
		fieldName:'cmv_disease_index',
		chineseName:'CMV病指',
		type:'compare',
		sel:'=',
		val:'',
		attach:[0.008,3.7034]
	},
	{
		fieldName:'anthrax_incidence',
		chineseName:'炭疽发病率',
		type:'compare',
		sel:'=',
		val:'',
		attach:[1.5,100]
	},
	{
		fieldName:'anthrax_finger',
		chineseName:'炭疽病指',
		type:'compare',
		sel:'=',
		val:'',
		attach:[0.04,4.8]
	},
	{
		fieldName:'remarks',
		chineseName:'备注',
		type:'text',
		val:'',
		attach:[]
	},
	{
		fieldName:'province',
		chineseName:'省',
		type:'select',
		val:'请选择。。。',
		attach:['安徽','北京','福建','甘肃','广东','广西','贵州','国外','河北','河南','黑龙江','湖北','湖南','吉林','江苏','江西','辽宁','内蒙古','宁夏','青海','山东','山西','陕西','上海','四川','台湾','天津','西藏','新疆','云南','浙江']
	},
]