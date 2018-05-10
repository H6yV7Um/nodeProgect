/**
 * Created by Genghaibin on 2016/8/29 0029.
 */
module.exports = [
    {
        code: "A",
        name: "个人信息",
        url: "/login/index",
        icon: "fa fa-user",
        class: [
        ],
    },
    {
        code: "#",
        name: "数据统计",
        url: "/login/index",
        icon: "fa fa-user",
        class: [
            {
                code: "#a",
                name: "数据统计",
                url: "/appdata",
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
                code: "#b",
                name: "入驻须知",
                url: "/login/enterpriseinstructions",
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
        code: "B",
        name: "门锁管理",
        url: "",
        icon: "fa fa-cog",
        class: [
            {
                code: "Ba",
                name: "所有门锁",
                url: "/lockadmin/alllocks",
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
                name: "添加门锁",
                url: "/lockadmin/addlock",
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
            {
                code: "Bc",
                name: "开锁记录",
                url: "/lockadmin/lockrecord",
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
            }
        ],
    },
    {
        code: "C",
        name: "创业服务管理",
        url: "",
        icon: "fa fa-ellipsis-v",
        class: [
            {
                code: "Ca",
                name: "分类列表",
                url: "/serviceadmin/serviceclass",
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
                name: "添加分类",
                url: "/serviceadmin/addclass",
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
        name: "广告管理",
        url: "",
        icon: "fa fa-building-o",
        class: [
            {
                code: "Da",
                name: "现有广告",
                url: "/advertise/advertisementlist",
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
                name: "添加广告",
                url: "/advertise/addadvertisement",
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
        ],
    },
    {
        code: "E",
        name: "定制服务管理",
        url: "",
        icon: "fa fa-suitcase",
        class: [
            {
                code: "Ea",
                name: "商品列表",
                url: "/goodsadmin/allgoodslist",
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
                name: "添加商品",
                url: "/goodsadmin/addgoods",
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
            // {
            //     code: "Ec",
            //     name: "服务列表",
            //     url: "/goodsadmin/getservergoods",
            //     section: [
            //         {
            //             code: "Ea01",
            //             name: "详细信息查询1",
            //         },
            //         {
            //             code: "Ea02",
            //             name: "详细信息查询1",
            //         },
            //     ]
            // },
            // {
            //     code: "Ed",
            //     name: "添加服务",
            //     url: "/goodsadmin/addservergoods",
            //     section: [
            //         {
            //             code: "Ea01",
            //             name: "详细信息查询1",
            //         },
            //         {
            //             code: "Ea02",
            //             name: "详细信息查询1",
            //         },
            //     ]
            // },
        ],
    },
    {
        code: "F",
        name: "审核管理",
        url: "",
        icon: "fa fa-check",
        class: [
            {
                code: "Fa",
                name: "入驻企业未审核",
                url: "/check/enterprisenocheck",
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
                name: "入驻企业已审核",
                url: "/check/enterprisechecked",
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
                name: "历史入驻企业",
                url: "/check/historychecked",
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
        name: "立体媒体服务管理",
        url: "",
        icon: "fa fa-video-camera",
        class: [
            {
                code: "Ga",
                name: "立体媒体服务列表",
                url: "/mediaadmin/getmedia",
                section: [
                    {
                        code: "Ga01",
                        name: "详细信息查询1",
                    },
                    {
                        code: "Ga02",
                        name: "详细信息查询1",
                    },
                ]
            },
            {
                code: "Gb",
                name: "添加立体媒体服务",
                url: "/mediaadmin/addmedia",
                section: [
                    {
                        code: "Ga01",
                        name: "详细信息查询1",
                    },
                    {
                        code: "Ga02",
                        name: "详细信息查询1",
                    },
                ]
            },
            {
                code: "Gc",
                name: "添加服务类别",
                url: "/mediaadmin/addserver",
                section: [
                    {
                        code: "Ga01",
                        name: "详细信息查询1",
                    },
                    {
                        code: "Ga02",
                        name: "详细信息查询1",
                    },
                ]
            },
            {
                code: "Gd",
                name: "立体媒体服务联系人",
                url: "/mediaadmin/linkway",
                section: [
                    {
                        code: "Ga01",
                        name: "详细信息查询1",
                    },
                    {
                        code: "Ga02",
                        name: "详细信息查询1",
                    },
                ]
            },
            {
                code: "Ge",
                name: "立体媒体服务申请",
                url: "/mediaadmin/mediaorder",
                section: [
                    {
                        code: "Ga01",
                        name: "详细信息查询1",
                    },
                    {
                        code: "Ga02",
                        name: "详细信息查询1",
                    },
                ]
            }
        ],
    },
    {
        code: "H",
        name: "用户管理",
        url: "",
        icon: "fa fa-users",
        class: [
            {
                code: "Ha",
                name: "所有用户",
                url: "/adminuser/alluserslist",
                section: [
                    {
                        code: "Ha01",
                        name: "详细信息查询1",
                    },
                    {
                        code: "Ha02",
                        name: "详细信息查询1",
                    },
                ]
            }
        ],
    },
    {
        code: "I",
        name: "快递服务",
        url: "",
        icon: "fa fa-cogs",
        class: [
            // {
            //     code: "Ia",
            //     name: "会议接待详情",
            //     url: "/meetreception/meetinginfo",
            //     section: [
            //         {
            //             code: "Ia01",
            //             name: "详细信息查询1",
            //         },
            //         {
            //             code: "Ia02",
            //             name: "详细信息查询1",
            //         },
            //     ]
            // },
            {
                code: "Ib",
                name: "外部接待联系人",
                url: "/meetreception/meetinglink",
                section: [
                    {
                        code: "Ib01",
                        name: "详细信息查询1",
                    },
                    {
                        code: "Ib02",
                        name: "详细信息查询1",
                    },
                ]
            },
            // {
            //     code: "Ic",
            //     name: "会议接待申请",
            //     url: "/printadmin/overtimelist",
            //     section: [
            //         {
            //             code: "Ic01",
            //             name: "详细信息查询1",
            //         },
            //         {
            //             code: "Ic02",
            //             name: "详细信息查询1",
            //         },
            //     ]
            // },
        ],
    },
    {
        code: "J",
        name: "订单管理",
        url: "/admin/revisepw",
        icon: "fa fa-yen",
        class: [
            {
                code: "Ja",
                name: "查看订单",
                url: "/orderadmin/getorders",
                section: [
                    {
                        code: "Ja01",
                        name: "详细信息查询1",
                    },
                    {
                        code: "Ja02",
                        name: "详细信息查询1",
                    },
                ]
            },
            {
                code: "Jb",
                name: "查看加班",
                url: "/printadmin/overtimelist",
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
                code: "Jc",
                name: "查看打印复印预约",
                url: "/printadmin/copylist",
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
                code: "Jd",
                name: "查看招聘信息",
                url: "/printadmin/invitelist",
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
                code: "Je",
                name: "查看应聘信息",
                url: "/printadmin/applyforjoblist",
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
        ],
    },
    {
        code: "K",
        name: "活动管理",
        url: "",
        icon: "fa fa-pagelines",
        class: [
            {
                code: "Ka",
                name: "活动列表",
                url: "/activityadmin/activitylist",
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
                code: "Kb",
                name: "添加活动",
                url: "/activityadmin/addactivity",
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
        code: "L",
        name: "资讯",
        url: "",
        icon: "fa fa-star-o",
        class: [
            {
                code: "La",
                name: "资讯列表",
                url: "/messageadmin/messagelist",
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

        ],
    },
    {
        code: "Z",
        name: "政策解读",
        url: "",
        icon: "fa fa-star-o",
        class: [
            {
                code: "Za",
                name: "政策解读列表",
                url: "/policyadmin/policyclass",
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

        ],
    },
    {
        code: "M",
        name: "办公室管理",
        url: "",
        icon: "fa fa-qrcode",
        class: [
            {
                code: "Ma",
                name: "办公室列表",
                url: "/officeadmin/officelist",
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
                code: "Mb",
                name: "添加办公室",
                url: "/officeadmin/addoffice",
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
                code: "Mc",
                name: "工位订单",
                url: "/officeadmin/stationorder",
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
    // {
    //     code: "N",
    //     name: "积分商品管理",
    //     url: "",
    //     icon: "fa fa-tachometer",
    //     class: [
    //         {
    //             code: "Na",
    //             name: "查询商品",
    //             url: "/integraladmin/allgoodslist",
    //             section: [
    //                 {
    //                     code: "Ca01",
    //                     name: "详细信息查询1",
    //                 },
    //                 {
    //                     code: "Ca02",
    //                     name: "详细信息查询1",
    //                 },
    //             ]
    //         },
    //         {
    //             code: "Nb",
    //             name: "添加商品",
    //             url: "/integraladmin/addgoods",
    //             section: [
    //                 {
    //                     code: "Cb01",
    //                     name: "详细信息查询2",
    //                 },
    //                 {
    //                     code: "Cb02",
    //                     name: "详细信息查询2",
    //                 },
    //             ]
    //         },
    //     ],
    // },
    {
        code: "N",
        name: "积分管理",
        url: "",
        icon: "fa fa-tachometer",
        class: [
            {
                code: "Na",
                name: "积分获取",
                url: "/integralconf/integralinfo",
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
            // {
            //     code: "Nb",
            //     name: "积分设置",
            //     url: "/integraladmin/addgoods",
            //     section: [
            //         {
            //             code: "Cb01",
            //             name: "详细信息查询2",
            //         },
            //         {
            //             code: "Cb02",
            //             name: "详细信息查询2",
            //         },
            //     ]
            // },
        ],
    },
    {
        code: "O",
        name: "初心创咖",
        url: "",
        icon: "fa fa-coffee",
        class: [
            {
                code: "Oi",
                name: "联系方式",
                url: "/ctypeadmin/contactway",
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
                code: "Oa",
                name: "类型列表",
                url: "/ctypeadmin/ctypelist",
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
                code: "Ob",
                name: "添加类型",
                url: "/ctypeadmin/addctype",
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
                code: "Oc",
                name: "店铺信息",
                url: "/cshopadmin/cshoplist",
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
                code: "Od",
                name: "商品列表",
                url: "/cgoodsadmin/cgoodslist",
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
                code: "Oe",
                name: "添加商品",
                url: "/cgoodsadmin/addcgoods",
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
                code: "Of",
                name: "初心创咖订单",
                url: "/cgoodsadmin/cgoodsorder",
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
                code: "Og",
                name: "初心创咖财务",
                url: "/cgoodsadmin/cgoodsfinance",
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
                code: "Oh",
                name: "分店列表",
                url: "/cgoodsadmin/shoplist",
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
                code: "Oi",
                name: "咖啡券须知",
                url: "/cgoodsadmin/coffeenotice",
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
        code: "P",
        name: "AA加速管理",
        url: "",
        icon: "fa fa-user",
        class: [
            {
                code: "Pa",
                name: "导师列表",
                url: "/teacher/teacherlist",
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
                code: "Pb",
                name: "添加导师",
                url: "/teacher/addteacher",
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
                code: "Pd",
                name: "课程体系",
                url: "/system/systemlist",
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
                code: "Pe",
                name: "所有课程",
                url: "/course/courselist",
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
                code: "Pc",
                name: "导师赛道",
                url: "/track/tracklist",
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
                code: "Pf",
                name: "AA加速订单",
                url: "/track/trackorder",
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
                code: "Pg",
                name: "AA加速财务",
                url: "/track/trackfinance",
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
                code: "Ph",
                name: "AA加速空间列表",
                url: "/track/trackinterspace",
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
        ],
    },
    {
        code: "Q",
        name: "会议室管理",
        url: "",
        icon: "fa fa-arrows",
        class: [
            {
                code: "Qa",
                name: "会议室列表",
                url: "/boardadmin/boardroomlist",
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
                code: "Qb",
                name: "添加会议室",
                url: "/boardadmin/addboardroom",
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
                code: "Qc",
                name: "会议室订单",
                url: "/boardadmin/boardroomorder",
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
        code: "R",
        name: "路演厅管理",
        url: "",
        icon: "fa fa-arrows-alt",
        class: [
            {
                code: "Ra",
                name: "路演厅列表",
                url: "/roadshowadmin/roadshowlist",
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
                code: "Rb",
                name: "添加路演厅",
                url: "/roadshowadmin/addroadshow",
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
                code: "Rc",
                name: "路演厅订单",
                url: "/roadshowadmin/roadshoworder",
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
        code: "S",
        name: "管理者",
        url: "",
        icon: "fa fa-user",
        class: [
            {
                code: "Sa",
                name: "管理者列表",
                url: "/adminuseradmin/adminuserlist",
                section: [
                    {
                        code: "Sa01",
                        name: "详细信息查询1",
                    },
                    {
                        code: "Sa02",
                        name: "详细信息查询1",
                    },
                ]
            },
            {
                code: "Sb",
                name: "添加管理者",
                url: "/adminuseradmin/addadminuser",
                section: [
                    {
                        code: "Sb01",
                        name: "详细信息查询2",
                    },
                    {
                        code: "Sb02",
                        name: "详细信息查询2",
                    },
                ]
            },
        ],
    },
    {
        code: "T",
        name: "空间管理",
        url: "",
        icon: "fa fa-circle",
        class: [
            {
                code: "Ta",
                name: "空间列表",
                url: "/interspaceadmin/allinterspace",
                section: [
                    {
                        code: "Sa01",
                        name: "详细信息查询1",
                    },
                    {
                        code: "Sa02",
                        name: "详细信息查询1",
                    },
                ]
            },
            {
                code: "Tb",
                name: "添加空间",
                url: "/interspaceadmin/addinterspace",
                section: [
                    {
                        code: "Tb01",
                        name: "详细信息查询2",
                    },
                    {
                        code: "Tb02",
                        name: "详细信息查询2",
                    },
                ]
            },
        ],
    },
    {
        code: "U",
        name: "财务管理",
        url: "",
        icon: "fa fa-yen",
        class: [
            {
                code: "Ua",
                name: "财务列表",
                url: "/financeadmin/financelist",
                section: [
                    {
                        code: "Ua01",
                        name: "详细信息查询1",
                    },
                    {
                        code: "Ua02",
                        name: "详细信息查询1",
                    },
                ]
            },
            {
                code: "Ub",
                name: "提现列表",
                url: "/financeadmin/withdrawlist",
                section: [
                    {
                        code: "Ub01",
                        name: "详细信息查询2",
                    },
                    {
                        code: "Ub02",
                        name: "详细信息查询2",
                    },
                ]
            },
        ],
    },
    {
        code: "Y",
        name: "健身房管理",
        url: "",
        icon: "fa fa-files-o",
        class: [
            {
                code: "Ya",
                name: "健身房列表",
                url: "/gymadmin/gymlist",
                section: [
                    {
                        code: "Ya01",
                        name: "详细信息查询1",
                    },
                    {
                        code: "Ya02",
                        name: "详细信息查询1",
                    },
                ]
            },
            {
                code: "Yb",
                name: "添加健身房",
                url: "/gymadmin/addgym",
                section: [
                    {
                        code: "Ya01",
                        name: "详细信息查询1",
                    },
                    {
                        code: "Ya02",
                        name: "详细信息查询1",
                    },
                ]
            },
            {
                code: "Yc",
                name: "健身房订单",
                url: "/gymadmin/gymorders",
                section: [
                    {
                        code: "Ya01",
                        name: "详细信息查询1",
                    },
                    {
                        code: "Ya02",
                        name: "详细信息查询1",
                    },
                ]
            },
            {
                code: "Yd",
                name: "健身房财务",
                url: "/gymadmin/gymfinance",
                section: [
                    {
                        code: "Ya01",
                        name: "详细信息查询1",
                    },
                    {
                        code: "Ya02",
                        name: "详细信息查询1",
                    },
                ]
            },
        ],
    },
    {
        code: "X",
        name: "健身教练管理",
        url: "",
        icon: "fa fa-bullhorn",
        class: [
            {
                code: "Xa",
                name: "健身教练列表",
                url: "/gymcoachadmin/gymcoachlist",
                section: [
                    {
                        code: "Xa01",
                        name: "详细信息查询1",
                    },
                    {
                        code: "Xa02",
                        name: "详细信息查询1",
                    },
                ]
            },
            {
                code: "Xb",
                name: "添加健身教练",
                url: "/gymcoachadmin/addgymcoach",
                section: [
                    {
                        code: "Xb01",
                        name: "详细信息查询1",
                    },
                    {
                        code: "Xb02",
                        name: "详细信息查询1",
                    },
                ]
            },
            {
                code: "Xc",
                name: "健身教练订单",
                url: "/gymcoachadmin/gymcoachorders",
                section: [
                    {
                        code: "Xb01",
                        name: "详细信息查询1",
                    },
                    {
                        code: "Xb02",
                        name: "详细信息查询1",
                    },
                ]
            },
            {
                code: "Xd",
                name: "健身教练财务",
                url: "/gymcoachadmin/gymcoachfinance",
                section: [
                    {
                        code: "Xb01",
                        name: "详细信息查询1",
                    },
                    {
                        code: "Xb02",
                        name: "详细信息查询1",
                    },
                ]
            },
        ],
    },
    {
        code: "V",
        name: "修改密码",
        url: "/login/revisepw",
        icon: "fa fa-krw",
        class: [

        ],
    },
    {
        code: "W",
        name: "联系方式列表",
        url: "/login/contactlist",
        icon: "fa fa-krw",
        class: [

        ],
    },
]