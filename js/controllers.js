var routeControllers = angular.module('routeControllers', []);

routeControllers.factory('Data',function ($http) {
    return {
      routeList: null,
      searchResult: null,
      getRouteList: function(callback,page){
        var _this = this;
        $http.jsonp('http://api.52youche.com/route/list?offset='+page+'&callback=JSON_CALLBACK',{cache:true}).success(function(data){
          var _routes = data.return.routes;
          for(var i = 0; i < _routes.length; i++){
           var route = _routes[i];
           route.start_time = new Date(parseInt(route.start_time)*1000).Format("MM-dd");
           route.start_area_name = route.start_area_name.substring(route.start_area_name.indexOf("-")+1,route.start_area_name.length);
           route.end_area_name = route.end_area_name.substring(route.end_area_name.indexOf("-")+1,route.end_area_name.length);
           route.start_name = route.start_name.length > 10 ? route.start_name.substr(0,10)+"...":route.start_name;
           route.end_name = route.end_name.length > 10 ? route.end_name.substr(0,10)+"...":route.end_name;
          }
          _this.setRouteList(_routes);
        }).then(callback);
      },
      setRouteList: function(result){
          this.routeList = result;
      },
      getRoute: function(route_id){
        for(var key in this.routeList){
          if(this.routeList[key].route_id == route_id){
            return this.routeList[key];
          }
        }
      },
      searchRoute: function(data,callback){
        var _this = this;
        var code = [];
        var url = "?";

        for(var key in data){
          if(data[key]){
            code.push(key+data[key]);
            url += key+"="+data[key]+'&';
          }
        }
        var rcode = code.sort().join("")+'wqestyuoopsxertyuiopssertyuiooewertyuoop';
        $http.jsonp('http://api.52youche.com/v2/route/searchweb/'+md5(rcode)+url+'callback=JSON_CALLBACK').success(function(data){
          if(data.retcode == 1001){
            var _routes = data.return.routes;
            for(var i = 0; i < _routes.length; i++){
             var route = _routes[i];
             route.start_time = new Date(parseInt(route.start_time)*1000).Format("MM-dd");
            }
            _this.searchResult = _routes;
          }else{
            return false;
          }
        }).then(callback);
      }
    };
});

routeControllers.controller('RouteListCtrl',['$scope','Data',
  function($scope, Data){
    if(!Data.routeList){
      Data.getRouteList(function(results){
        $scope.routes = Data.routeList;
     });
    }else{
      $scope.routes = Data.routeList;
    }
    $scope.orderProp = 'id';
    $scope.offset = 0;
    $scope.listtype = 'find_passenger';
    $scope.changeList = function(type){
      $scope.listtype = type;
    };
    $scope.search = function(){
      if(!poi.start_lng){
        alert("亲，只要输入起点就可以搜索！");
        return false;
      }
      Data.searchRoute(poi,function(){
        $scope.routes = Data.searchResult;
      });
    };
  }]);

routeControllers.controller('RouteDetailCtrl', ['$scope', 'Data', '$routeParams','$http',
  function($scope, Data, $routeParams, $http) {
    $scope.routeId = $routeParams.routeId;
    if(!Data.routeList){
      Data.getRouteList(function(){
        $scope.route = Data.getRoute($scope.routeId);
      });
    }else{
      $scope.route = Data.getRoute($scope.routeId);
    }
    $http.jsonp('http://api.52youche.com/route/locimg-web/'+$scope.routeId+'/560/231?callback=JSON_CALLBACK').success(function(data){
      $scope.thumb = data.return.img;
    });
  }]);

routeControllers.controller('HomeCtrl', ['$scope', 'Data', '$location','$route',
  function($scope, Data, $location,$route) {
    $scope.backhome = function(){
      $location.path('/');
      $route.reload();
    }
}]);

routeControllers.run(function ($rootScope, $location, $window) {
    var history = [];
    $rootScope.$on('$routeChangeStart',function(evt, absNewUrl, absOldUrl){
      $window.scrollTo(0,0);
    });

    $rootScope.$on('$routeChangeSuccess', function() {
        history.push($location.$$path);
    });
    
    $rootScope.back = function () {
        var prevUrl = history.length > 1 ? history.splice(-2)[0] : "/";
        $location.path(prevUrl);
    };
});