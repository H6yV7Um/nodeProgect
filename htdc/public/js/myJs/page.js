function page(counturl,dataurl,pagesize){
    var app = angular.module("myApp", []);
    app.controller("pageCtrl", function ($scope, $http) {
        //$scope.allprice = (parseFloat(document.getElementById("diliveryman").value) * parseFloat(document.getElementById("diliverymanphone").value)).toFixed(2)
        $scope.pagesize = pagesize;
        $scope.selpage = 1;
        $scope.pages;
        $http({
            method: 'get',
            url: counturl,
        }).success(function (data, header, config, status) {
            $scope.data = data;
            $scope.num = data;
            $scope.pages = Math.ceil($scope.data / $scope.pagesize); //分页数
            $scope.pagelist = [];
            $scope.getdatainfo($scope.selpage);
            $scope.pagelist = $scope.calculateIndexes($scope.selpage,$scope.pages);
        })
        //设置分页样式
        $scope.isactivepage = function (page) {
            return $scope.selpage == page;
        };
        //获取每页数据
        $scope.getdatainfo = function (page) {
            $http({
                method: 'get',
                url:dataurl+'/'+page,
            }).success(function (data, header, config, status) {
                //alert(JSON.stringify(data))
                $scope.items = data;
            })
        }
        //分页算法
        $scope.calculateIndexes = function (current, length) {
            //current 当前页码
            //length  总页码
            //displayLength  显示长度
            var displayLength = 4;
            var indexes = [];
            var start = Math.round(current - displayLength / 2);
            var end = Math.round(current + displayLength / 2);
            if (start <= 1) {
                start = 1;
                end = start + displayLength - 1;
                if (end >= length - 1) {
                    end = length - 1;
                }
            }
            if (end >= length - 1) {
                end = length;
                start = end - displayLength + 1;
                if (start <= 1) {
                    start = 1;
                }
            }
            var newstart = start-1;
            if(newstart == 0){
                newstart = 1
            }else{
                newstart = newstart
            }
            for (var i = newstart; i <= end; i++) {
                indexes.push(i);
            }
            //$scope.isactivepage(current);
            return indexes;
        };
        //选择页码
        $scope.selectpage = function (page) {
            $scope.selpage = page;
            $scope.getdatainfo(page);
            $scope.pagelist = $scope.calculateIndexes(page, $scope.pages);
        }
        //上一页
        $scope.first = function(){
            $scope.selpage = 1;
            $scope.getdatainfo($scope.selpage);
            $scope.pagelist = $scope.calculateIndexes($scope.selpage, $scope.pages);
        }
        //下一页
        $scope.last = function(){
            $scope.selpage = $scope.pages;
            $scope.getdatainfo($scope.selpage);
            $scope.pagelist = $scope.calculateIndexes($scope.selpage, $scope.pages);
        }

    })
}