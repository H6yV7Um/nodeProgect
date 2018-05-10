/**
 * Created by Genghaibin on 2016/8/29 0029.
 */
module.exports = [
    {
        code: "A",
        name: "收银",
        url: "/shopadmin/index",
        icon: "fa fa-home",
        class: [],
    },
    {
        code: "B",
        name: "商品分类管理",
        url: "",
        icon: "fa fa-user",
        class: [
            {
                code: "Ba",
                name: "所有分类",
                url: "/goodsclass/allgoodsclass",
                section: [
                    {
                        code: "Ba01",
                        name: "详细信息查询1",
                    },
                    {
                        code: "Ba02",
                        name: "详细信息查询1",
                    },
                ]
            },
            {
                code: "Bb",
                name: "添加分类",
                url: "/goodsclass/addgoodsclass",
                section: [
                    {
                        code: "Bb01",
                        name: "详细信息查询2",
                    },
                    {
                        code: "Bb02",
                        name: "详细信息查询2",
                    },
                ]
            },
        ],
    },
    {
        code: "C",
        name: "商品管理",
        url: "",
        icon: "fa fa-group",
        class: [
            {
                code: "Ca",
                name: "所有商品",
                url: "/goodsadmin/allgoods",
                section: [
                    {
                        code: "Ca01",
                        name: "详细信息查询1",
                    },
                    {
                        code: "Ca02",
                        name: "详细信息查询1",
                    },
                ]
            },
            {
                code: "Cb",
                name: "添加商品",
                url: "/goodsadmin/addgoods",
                section: [
                    {
                        code: "Cb01",
                        name: "详细信息查询2",
                    },
                    {
                        code: "Cb02",
                        name: "详细信息查询2",
                    },
                ]
            },
            {
                code: "Cc",
                name: "库存管理",
                url: "/goodsadmin/inventorylist",
                section: [
                    {
                        code: "Cb01",
                        name: "详细信息查询2",
                    },
                    {
                        code: "Cb02",
                        name: "详细信息查询2",
                    },
                ]
            },
            {
                code: "Cd",
                name: "进货查询",
                url: "/goodsadmin/stocklist",
                section: [
                    {
                        code: "Cb01",
                        name: "详细信息查询2",
                    },
                    {
                        code: "Cb02",
                        name: "详细信息查询2",
                    },
                ]
            },
        ],
    },
    {
        code: "D",
        name: "订单管理",
        url: "",
        icon: "fa fa-building-o",
        class: [
            {
                code: "Da",
                name: "线上订单",
                url: "/orderadmin/commonorderlist",
                section: [
                    {
                        code: "Da01",
                        name: "详细信息查询1",
                    },
                    {
                        code: "Da02",
                        name: "详细信息查询1",
                    },
                ]
            },
            {
                code: "Db",
                name: "语音订单",
                url: "/orderadmin/voiceorderlist",
                section: [
                    {
                        code: "Db01",
                        name: "查询待审核商品信息",
                    },
                    {
                        code: "Db02",
                        name: "详细信息查询2",
                    },
                ]
            },
            {
                code: "Dc",
                name: "线下订单",
                url: "/orderadmin/offlineorderlist",
                section: [
                    {
                        code: "Da01",
                        name: "详细信息查询1",
                    },
                    {
                        code: "Da02",
                        name: "详细信息查询1",
                    },
                ]
            },
            // {
            //     code: "Dd",
            //     name: "下单说明",
            //     url: "/orderadmin/orderinfo",
            //     section: [
            //         {
            //             code: "Da01",
            //             name: "详细信息查询1",
            //         },
            //         {
            //             code: "Da02",
            //             name: "详细信息查询1",
            //         },
            //     ]
            // },
        ],
    },
    {
        code: "E",
        name: "配送管理",
        url: "",
        icon: "fa fa-sitemap",
        class: [
            {
                code: "Ea",
                name: "待送货",
                url: "/distribution/nodistribution",
                section: [
                    {
                        code: "Ea01",
                        name: "详细信息查询1",
                    },
                    {
                        code: "Ea02",
                        name: "详细信息查询1",
                    },
                ]
            },
            {
                code: "Eb",
                name: "配送中",
                url: "/distribution/distributioning",
                section: [
                    {
                        code: "Ea01",
                        name: "详细信息查询1",
                    },
                    {
                        code: "Ea02",
                        name: "详细信息查询1",
                    },
                ]
            },
            {
                code: "Ec",
                name: "已完成",
                url: "/distribution/distributioned",
                section: [
                    {
                        code: "Ea01",
                        name: "详细信息查询1",
                    },
                    {
                        code: "Ea02",
                        name: "详细信息查询1",
                    },
                ]
            },
            {
                code: "Ed",
                name: "配送员设置",
                url: "/distribution/distributeman",
                section: [
                    {
                        code: "Ea01",
                        name: "详细信息查询1",
                    },
                    {
                        code: "Ea02",
                        name: "详细信息查询1",
                    },
                ]
            },
        ],
    },
    {
        code: "F",
        name: "快递管理",
        url: "",
        icon: "fa fa-sitemap",
        class: [
            {
                code: "Fa",
                name: "添加快递",
                url: "/expressage/addexpressage",
                section: [
                    {
                        code: "Fa01",
                        name: "详细信息查询1",
                    },
                    {
                        code: "Fa02",
                        name: "详细信息查询1",
                    },
                ]
            },
            {
                code: "Fb",
                name: "收到消息未领取快递",
                url: "/expressage/expressagelist",
                section: [
                    {
                        code: "Fb01",
                        name: "详细信息查询1",
                    },
                    {
                        code: "Fb02",
                        name: "详细信息查询1",
                    },
                ]
            },
            {
                code: "Fc",
                name: "未收到消息未领取快递",
                url: "/expressage/nomesgexpressagelist",
                section: [
                    {
                        code: "Fc01",
                        name: "详细信息查询1",
                    },
                    {
                        code: "Fc02",
                        name: "详细信息查询1",
                    },
                ]
            },
            {
                code: "Fd",
                name: "已领取快递查询",
                url: "/expressage/getexpressagelist",
                section: [
                    {
                        code: "Fc01",
                        name: "详细信息查询1",
                    },
                    {
                        code: "Fc02",
                        name: "详细信息查询1",
                    },
                ]
            },
            {
                code: "Fe",
                name: "已入库未领取快递",
                url: "/expressage/expressagenoreceive",
                section: [
                    {
                        code: "Fc01",
                        name: "详细信息查询1",
                    },
                    {
                        code: "Fc02",
                        name: "详细信息查询1",
                    },
                ]
            },
        ],
    },
    {
        code: "G",
        name: "跑腿服务管理",
        url: "",
        icon: "fa fa-sitemap",
        class: [
            {
                code: "Ga",
                name: "跑腿订单未处理",
                url: "/runservice/runnoservice",
                section: [
                    {
                        code: "Fa01",
                        name: "详细信息查询1",
                    },
                    {
                        code: "Fa02",
                        name: "详细信息查询1",
                    },
                ]
            },
            {
                code: "Gb",
                name: "跑腿订单处理中",
                url: "/runservice/runserviceing",
                section: [
                    {
                        code: "Fb01",
                        name: "详细信息查询1",
                    },
                    {
                        code: "Fb02",
                        name: "详细信息查询1",
                    },
                ]
            },
            {
                code: "Gc",
                name: "跑腿订单已完成",
                url: "/runservice/runserviced",
                section: [
                    {
                        code: "Fd01",
                        name: "详细信息查询1",
                    },
                    {
                        code: "Fd02",
                        name: "详细信息查询1",
                    },
                ]
            },
            {
                code: "Gd",
                name: "跑腿服务说明",
                url: "/runservice/runserviceinfo",
                section: [
                    {
                        code: "Fd01",
                        name: "详细信息查询1",
                    },
                    {
                        code: "Fd02",
                        name: "详细信息查询1",
                    },
                ]
            },
        ],
    },
    {
        code: "H",
        name: "财务统计",
        url: "/revisepw/revisepassword",
        icon: "fa fa-asterisk",
        class: [
            {
                code: "Ha",
                name: "本日收入",
                url: "/shopfinance/shopdayfinance",
                section: [
                    {
                        code: "Fa01",
                        name: "详细信息查询1",
                    },
                    {
                        code: "Fa02",
                        name: "详细信息查询1",
                    },
                ]
            },
            {
                code: "Hb",
                name: "本月收入",
                url: "/shopfinance/shopmonthfinance",
                section: [
                    {
                        code: "Fb01",
                        name: "详细信息查询1",
                    },
                    {
                        code: "Fb02",
                        name: "详细信息查询1",
                    },
                ]
            },
            {
                code: "Hc",
                name: "本年收入",
                url: "/shopfinance/shopyearfinance",
                section: [
                    {
                        code: "Fd01",
                        name: "详细信息查询1",
                    },
                    {
                        code: "Fd02",
                        name: "详细信息查询1",
                    },
                ]
            },
            // {
            //     code: "Hd",
            //     name: "最近一周收入",
            //     url: "/shopfinance/shopweekfinance",
            //     section: [
            //         {
            //             code: "Fd01",
            //             name: "详细信息查询1",
            //         },
            //         {
            //             code: "Fd02",
            //             name: "详细信息查询1",
            //         },
            //     ]
            // },
        ],
    },
    {
        code: "I",
        name: "意见反馈",
        url: "",
        icon: "fa fa-cogs",
        class: [
            {
                code: "Ia",
                name: "用户反馈",
                url: "/tips/tipslist",
                section: [
                    {
                        code: "Ia01",
                        name: "详细信息查询1",
                    },
                    {
                        code: "Ia02",
                        name: "详细信息查询1",
                    },
                ]
            }
        ],
    },
    {
        code: "J",
        name: "修改密码",
        url: "/shopadmin/revisepw",
        icon: "fa fa-asterisk",
        class: [],
    },
]