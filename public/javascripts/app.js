var app = angular.module('angularjsNodejsTutorial', []);

// Controller for the Dashboard page
app.controller('dashboardController', function($scope, $http) {
  $http({
    url: '/genres',
    method: 'GET'
  }).then(res => {
    console.log("GENRES: ", res.data);
    $scope.genres = res.data;
  }, err => {
    console.log("Genre ERROR: ", err);
  });

  $scope.showMovies = function(g) {
     $http({
        url: `/genres/${g.genre}`,
        method: 'GET'
      }).then(res => {
        console.log("MOVIES: ", res.data);
        $scope.movies = res.data;
      }, err => {
        console.log("Movies ERROR: ", err);
      });
  }
});

// Controller for the Recommendations Page
app.controller('recommendationsController', function($scope, $http) {
  // TODO: Q2
  $scope.submitIds = function() {
      $http({
        url: `/recommendations/${$scope.movieName}`,
        method: 'GET'
      }).then(res => {
        console.log("MOVIES: ", res.data);
        $scope.recommendedMovies = res.data;
      }, err => {
        console.log("Movies ERROR: ", err);
      });
  }
});

// Controller for the Best Of Page
app.controller('bestofController', function($scope, $http) {
  $http({
    url: '/decades',
    method: 'GET'
  }).then(res => {
    console.log("DECADES: ", res.data);
    $scope.decades = res.data;
  }, err => {
    console.log("Decade ERROR: ", err);
  });

  $scope.submitDecade = function() {
     $http({
        url: `/bestOf/${$scope.selectedDecade.decade}`,
        method: 'GET'
      }).then(res => {
        console.log("BEST OF: ", res.data);
        $scope.bestofMovies = res.data;
      }, err => {
        console.log("BestOf ERROR: ", err);
      });
  }
});
