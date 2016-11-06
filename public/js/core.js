var app = angular.module('elfin', []);

app.controller('wordlist', function($scope,$http) {

    $scope.domain = "gmail.com";

    $scope.list = [];
    $scope.dict = {};

    $scope.getList = function() {
        if ($scope.domain){
          $scope.list = []; // clear the list
          $scope.dict = {}; // clear the dictionary

          var s = $scope.domain.toLowerCase().split(".");
          var arr = s[0].split("");
          $scope.tld = s.splice(1,s.length).join("");
          permuteTree('',arr);

          $http({
              method: 'POST',
              url: '/domains',
              data: {
                list : $scope.list,
                tld  : $scope.tld
              }
          }).then(function successCallback(res) {
                $scope.dict = res.data;
              }, function errorCallback(res) {
                console.log(res)
          });
        }
    };

    // Will build this up over time
    var dict = {
      "m" : ["rn", "rri"],
      "l" : ["I"]
    }

    function permuteTree(prev, arr){
      for (var i = 0; i < arr.length; i++ ) {
        if (dict.hasOwnProperty(arr[i])) {
          var aft = arr.slice(i);
          var fore = prev + arr.slice(0,i).join("")

          var alts = dict[arr[i]];
          for (var j=0; j < alts.length; j++) {
            aft[0] = alts[j];
            // Keep the front part fixed and modify the rest
            $scope.list.push(fore + aft.join("") + "." + $scope.tld);
            permuteTree(fore,aft);
          }
        }
      }
    }

    // crude for now.
    $scope.validate = /^(?:[a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i
});
