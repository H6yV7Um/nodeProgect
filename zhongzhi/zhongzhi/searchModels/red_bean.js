/**
 * 赤豆/小豆
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
		fieldName:'family_name',
		chineseName:'科名',
		type:'select',
		val:'请选择。。。',
		attach:['Leguminosae(豆科)']
	},
	{
		fieldName:'generic_name',
		chineseName:'属名',
		type:'select',
		val:'请选择。。。',
		attach:['Vigna(豇豆属)']
	},
	{
		fieldName:'name',
		chineseName:'学名',
		type:'select',
		val:'请选择。。。',
		attach:['Vigna angularis (Willd)Ohwi&Ohashi(小豆)']
	},
	{
		fieldName:'breeding_unit',
		chineseName:'选育单位',
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
		fieldName:'altitude',
		chineseName:'高程',
		type:'compare',
		sel:'=',
		val:'',
		attach:[1,3000]
	},
	{
		fieldName:'east_longitude',
		chineseName:'东经',
		type:'compare',
		sel:'=',
		val:'',
		attach:[8000,13000]
	},
	{
		fieldName:'north_latitude',
		chineseName:'北纬',
		type:'compare',
		sel:'=',
		val:'',
		attach:[18,55]
	},
	{
		fieldName:'country_of_origin',
		chineseName:'原产地',
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
		fieldName:'incubation_year',
		chineseName:'育成年份',
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
		fieldName:'growth_habit',
		chineseName:'生长习性',
		type:'select',
		val:'请选择。。。',
		attach:['矮生','半蔓生','蔓生','直立','匍匐']
	},
	{
		fieldName:'sowing_date',
		chineseName:'播种期',
		type:'compare',
		sel:'=',
		val:'',
		attach:[4.02,9.2]
	},
	{
		fieldName:'mature_period',
		chineseName:'成熟期',
		type:'compare',
		sel:'=',
		val:'',
		attach:[7.26,11.12]
	},
	{
		fieldName:'total_reproductive_days',
		chineseName:'全生育日数',
		type:'compare',
		sel:'=',
		val:'',
		attach:[71,196]
	},
	{
		fieldName:'color',
		chineseName:'花色',
		type:'select',
		val:'请选择。。。',
		attach:['白','黄','浅黄','紫']
	},
	{
		fieldName:'plant_height',
		chineseName:'株高',
		type:'compare',
		sel:'=',
		val:'',
		attach:[9,180]
	},
	{
		fieldName:'branch_number',
		chineseName:'分枝数',
		type:'compare',
		sel:'=',
		val:'',
		attach:[0.2,31]
	},
	{
		fieldName:'pod_number_per_plant',
		chineseName:'单株荚数',
		type:'compare',
		sel:'=',
		val:'',
		attach:[1.4,150.2]
	},
	{
		fieldName:'number_of_pods_per_pod',
		chineseName:'单荚粒数',
		type:'compare',
		sel:'=',
		val:'',
		attach:[0.5,20.8]
	},
	{
		fieldName:'grain_weight_per_plant',
		chineseName:'单株产量',
		type:'compare',
		sel:'=',
		val:'',
		attach:[0.8,100.3]
	},
	{
		fieldName:'pod_bearing_habit',
		chineseName:'结荚习性',
		type:'select',
		val:'请选择。。。',
		attach:['无限','亚有限','有限']
	},
	{
		fieldName:'pod_color',
		chineseName:'荚色',
		type:'select',
		val:'请选择。。。',
		attach:['白','白黄','白绿','橙','褐','褐斑','褐黑','褐黄','褐绿','黑','黑白','黑褐','黑灰','黑绿','黄','黄白','黄褐','绿','浅褐','浅红','浅黄','深褐','棕绿']
	},
	{
		fieldName:'pod_length',
		chineseName:'荚长',
		type:'compare',
		sel:'=',
		val:'',
		attach:[3.8,17.8]
	},
	{
		fieldName:'grain_color',
		chineseName:'粒色',
		type:'select',
		val:'请选择。。。',
		attach:['白','白（灰）','橙','褐','黑','红','花斑','花纹','黄','黄白','黄褐','金黄','绿','绿纹','麻','浅绿','深红','杏红','杏黄','紫']
	},
	{
		fieldName:'grain_shape',
		chineseName:'粒形',
		type:'select',
		val:'请选择。。。',
		attach:['扁圆','长圆柱','短圆柱','短圆锥','球形','椭圆','圆形','圆柱']
	},
	{
		fieldName:'grain_weight',
		chineseName:'百粒重',
		type:'compare',
		sel:'=',
		val:'',
		attach:[1.8,20.1]
	},
	{
		fieldName:'protein',
		chineseName:'蛋白质',
		type:'compare',
		sel:'=',
		val:'',
		attach:[16.33,29.2]
	},
	{
		fieldName:'fat',
		chineseName:'脂肪',
		type:'compare',
		sel:'=',
		val:'',
		attach:[0.04,2.65]
	},
	{
		fieldName:'total_starch',
		chineseName:'总淀粉',
		type:'compare',
		sel:'=',
		val:'',
		attach:[39.38,59.89]
	},
	{
		fieldName:'amylose',
		chineseName:'直链淀粉',
		type:'compare',
		sel:'=',
		val:'',
		attach:[8.32,17.9]
	},
	{
		fieldName:'amylopectin',
		chineseName:'支链淀粉',
		type:'compare',
		sel:'=',
		val:'',
		attach:[25.33,54.02]
	},
	{
		fieldName:'drought_resistance_at_bud_stage',
		chineseName:'芽期抗旱',
		type:'compare',
		sel:'=',
		val:'',
		attach:[1,5]
	},
	{
		fieldName:'drought_resistance_in_mature_stage',
		chineseName:'熟期抗旱',
		type:'compare',
		sel:'=',
		val:'',
		attach:[1,5]
	},
	{
		fieldName:'salt_tolerance_at_bud_stage',
		chineseName:'芽期耐盐',
		type:'compare',
		sel:'=',
		val:'',
		attach:[1,5]
	},
	{
		fieldName:'salt_tolerance_in_seedling_stage',
		chineseName:'苗期耐盐',
		type:'compare',
		sel:'=',
		val:'',
		attach:[2,5]
	},
	{
		fieldName:'cold_hardiness_at_bud_stage',
		chineseName:'芽期抗寒',
		type:'compare',
		sel:'=',
		val:'',
		attach:[1,5]
	},
	{
		fieldName:'florescence_cold_resistance spot',
		chineseName:'花期抗寒',
		type:'compare',
		sel:'=',
		val:'',
		attach:[1,5]
	},
	{
		fieldName:'leaf_spot',
		chineseName:'叶斑病级',
		type:'text',
		val:'',
		attach:[]
	},
	{
		fieldName:'leaf_spot_index',
		chineseName:'叶斑病指数',
		type:'compare',
		sel:'=',
		val:'',
		attach:[7.7,100]
	},
	{
		fieldName:'leaf_spot_evaluation',
		chineseName:'叶斑病评价',
		type:'select',
		val:'请选择。。。',
		attach:['HS','MR','MS','R','S']
	},
	{
		fieldName:'rust_severity',
		chineseName:'锈病严重度',
		type:'compare',
		sel:'=',
		val:'',
		attach:[0,100]
	},
	{
		fieldName:'prevalence_of_rust',
		chineseName:'锈病普遍率',
		type:'compare',
		sel:'=',
		val:'',
		attach:[0,100]
	},
	{
		fieldName:'rust_index',
		chineseName:'锈病指数',
		type:'compare',
		sel:'=',
		val:'',
		attach:[0,100]
	},
	{
		fieldName:'rust_resistance',
		chineseName:'锈病抗性',
		type:'select',
		val:'请选择。。。',
		attach:['HR','HS','MR','MS','R','S']
	},
	{
		fieldName:'aphid_index',
		chineseName:'蚜害指数',
		type:'compare',
		sel:'=',
		val:'',
		attach:[35,100]
	},
	{
		fieldName:'the_level_of_aphid_disease',
		chineseName:'蚜害病级别',
		type:'compare',
		sel:'=',
		val:'',
		attach:[5,9]
	},
	{
		fieldName:'evaluation_of_diseased_aphids',
		chineseName:'蚜害病评价',
		type:'select',
		val:'请选择。。。',
		attach:['HS','MR','R','S']
	},
	{
		fieldName:'aphid_ratio',
		chineseName:'蚜害比值',
		type:'compare',
		sel:'=',
		val:'',
		attach:[0.38,1.41]
	},
	{
		fieldName:'aspartic_acid',
		chineseName:'天冬氨酸',
		type:'compare',
		sel:'=',
		val:'',
		attach:[2.13,3.67]
	},
	{
		fieldName:'threonine',
		chineseName:'苏氨酸',
		type:'compare',
		sel:'=',
		val:'',
		attach:[0.6,1.26]
	},
	{
		fieldName:'serine',
		chineseName:'丝氨酸',
		type:'compare',
		sel:'=',
		val:'',
		attach:[0.61,1.65]
	},
	{
		fieldName:'glutamate',
		chineseName:'谷氨酸',
		type:'compare',
		sel:'=',
		val:'',
		attach:[3.25,5.78]
	},
	{
		fieldName:'glycine',
		chineseName:'甘氨酸',
		type:'compare',
		sel:'=',
		val:'',
		attach:[0.1,1.71]
	},
	{
		fieldName:'alanine',
		chineseName:'丙氨酸',
		type:'compare',
		sel:'=',
		val:'',
		attach:[0.7,1.25]
	},
	{
		fieldName:'cystine',
		chineseName:'胱氨酸',
		type:'compare',
		sel:'=',
		val:'',
		attach:[0.07,1.54]
	},
	{
		fieldName:'valine',
		chineseName:'缬氨酸',
		type:'compare',
		sel:'=',
		val:'',
		attach:[0.94,1.85]
	},
	{
		fieldName:'methionine',
		chineseName:'蛋氨酸',
		type:'compare',
		sel:'=',
		val:'',
		attach:[0.03,1.02]
	},
	{
		fieldName:'isoleucine',
		chineseName:'异亮氨酸',
		type:'compare',
		sel:'=',
		val:'',
		attach:[0.71,1.52]
	},
	{
		fieldName:'leucine',
		chineseName:'亮氨酸',
		type:'compare',
		sel:'=',
		val:'',
		attach:[1.21,2.51]
	},
	{
		fieldName:'tyrosine',
		chineseName:'酪氨酸',
		type:'compare',
		sel:'=',
		val:'',
		attach:[0.27,1.06]
	},
	{
		fieldName:'phenylalanine',
		chineseName:'苯丙氨酸',
		type:'compare',
		sel:'=',
		val:'',
		attach:[1.13,2.22]
	},
	{
		fieldName:'lysine',
		chineseName:'赖氨酸',
		type:'compare',
		sel:'=',
		val:'',
		attach:[1.12,2.23]
	},
	{
		fieldName:'histidine',
		chineseName:'组氨酸',
		type:'compare',
		sel:'=',
		val:'',
		attach:[0.25,1.1]
	},
	{
		fieldName:'arginine',
		chineseName:'精氨酸',
		type:'compare',
		sel:'=',
		val:'',
		attach:[0.74,2.52]
	},
	{
		fieldName:'proline',
		chineseName:'脯氨酸',
		type:'compare',
		sel:'=',
		val:'',
		attach:[0.24,1.65]
	},
	{
		fieldName:'typtophan',
		chineseName:'色氨酸',
		type:'compare',
		sel:'=',
		val:'',
		attach:[0.11,0.23]
	},
	{
		fieldName:'the_sum',
		chineseName:'总和',
		type:'compare',
		sel:'=',
		val:'',
		attach:[18.61,29.14]
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
	{
		fieldName:'area',
		chineseName:'区',
		type:'select',
		val:'请选择。。。',
		attach:['东北','国外','华北','华南','西北','中部']
	},
	{
		fieldName:'sample_type',
		chineseName:'样品类型',
		type:'select',
		val:'请选择。。。',
		attach:['地方','国外','选育']
	},
]