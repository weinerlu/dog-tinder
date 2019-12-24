var app = angular.module('angularjsNodejsTutorial', []);

// Controller for the dog grid on the homepage
app.controller('dashboardController', function($scope, $http) {
  $scope.dogs = {};

  $http({
    url: '/dogs',
    method: 'GET'
  }).then(res => {
    console.log("Dogs: ", res.data);
    $scope.dogs = res.data;
  }, err => {
    console.log("Dogs ERROR: ", err);
  });
});

// Controller for the Tinder page
app.controller('tinderController', function($scope, $http) {
  $http({
    url: '/tinder/:tinder',
    method: 'GET'
  }).then(res => {
    console.log("First Dog: ", res.data);
    $scope.tinder = res.data;
  }, err => {
    console.log("First Dog ERROR: ", err);
  });

  //Display the next dog to be swiped on
  $scope.nextDog = function() {
    $http({
      url: '/tinder/:tinder',
      method: 'GET'
    }).then(res => {
      console.log("Next Dog: ", res.data);
      $scope.tinder = res.data;
    }, err => {
      console.log("Next Dog ERROR: ", err);
    });
  }

  //If user likes the dog
  $scope.goodDog = function(dog) {
    var url = `/tinder/good/${dog.id}`;
    $http({
      url: url,
      method: 'GET'
    }).then(res => {
      console.log("Good Dog: ", res.data);

      if(res.data === true) {
        $scope.end = true;
      } else {
        $scope.goodDog = res.data;
        $scope.end = false;
      }
    }, err => {
      console.log("Good Dog ERROR: ", err);
    });
  };

  //If user dislikes the dog
  $scope.badDog = function(dog) {
    var url = `/tinder/bad/${dog.id}`;
    $http({
      url: url,
      method: 'GET'
    }).then(res => {
      console.log("Bad Dog: ", res.data);
      if(res.data === true) {
        $scope.end = true;
      } else {
        $scope.badDog = res.data;
        $scope.end = false;
      }
    }, err => {
      console.log("Bad Dog ERROR: ", err);
    });
  };
});

// Controller for the final results page
app.controller('finalController', function($scope, $http) {
  $http({
    url: '/final/:final',
    method: 'GET'
  }).then(res => {
    console.log(res.data);
    $scope.finalDog = res.data;
  }).catch(err => {
    console.log("Error: ", err);
  });
  
  //Display photo grid of final breed
  $scope.dogPhotos = function(dog) {
    var url = `/final/final/${dog.breed_id}`;
    $http({
      url: url,
      method: 'GET'
    }).then(res => {
      console.log("Photos: ", res.data);
      $scope.dogPhotos = res.data;
    }, err => {
      console.log("Good Dog ERROR: ", err);
    });
  };
});

// Controller for the breed guesser
app.controller('guesserController', function($scope, $http) {
  $http({
    url: '/guesser/:guesser',
    method: 'GET'
  }).then(res => {
    console.log("Colors: ", res.data);
    $scope.breeds = res.data;
    $scope.weights = [5,10,15,20,25,30,35,40,45,50,55,60,65,70,75,80,85,90,95,100,105,110,115,120];
    $scope.heights = [5,10,15,20,25,30,35,40,45,50,55,60,65,70];
  }, err => {
    console.log("Colors ERROR: ", err);
  });

  //When submit button is pressed
  $scope.submit = function() {
    var url = `/guesser/${$scope.selectedColor.color}/${$scope.selectedWeight}/${$scope.selectedHeight}`;
    if ($scope.selectedColor !== "") {
      $http({
        url: url,
        method: 'GET'
      }).then(res => {
        if(res.data !== undefined && res.data.length != 0){
          $scope.dog = res.data;
        } else {
        $scope.dog = [{breed: "Sorry we couldn't find a breed with those qualities"}];
        }
      }, err => {
        console.log("Breed Guesser ERROR: ", err);
      });
    }
  };
});
