//Made by Henry Kaufman
var app = angular.module('reddit-clone', ['ngRoute', 'firebase']);

//The Firebase URL set as a Constant
app.constant('fbURL', 'https://unknown-chat.firebaseio.com');

//Creating a factory so we can use the Firebase URL
app.factory('Posts', function ($firebase, fbURL) {
    return $firebase(new Firebase(fbURL)).$asArray();
});

//Configuring the route providers to redirect to the right location
app.config(function ($routeProvider) {
    $routeProvider
        .when('/', {
            controller: 'MainController',
            templateUrl: 'main.html'
        })
        .otherwise({
            redirectTo: '/'
        })
});

//The Main Controller that holds everything
app.controller('MainController', function ($scope, $firebase, Posts) {

    //Set the posts we get to a global variable that can be used
    $scope.posts = Posts;

    //The function that runs when the user saves a post
    $scope.savePost = function (post) {
        if (post.name && post.description && post.url && $scope.authData) {
            //Actually adding the posts to the Firebase
            Posts.$add({
                //Setting the post name
                name: post.name,
                //Setting the post description
                description: post.description,
                //Setting the post URL
                url: post.url,
                //Setting the post votes
                votes: 0,
                //Getting the current user
                user: $scope.authData.twitter.username
            });

            //Resetting all the values
            post.name = "";
            post.description = "";
            post.url = "";
        } else {
            //An alert to tell the user to log in or put something in all the fields
            alert('Sorry bro, you need all of those inputs to be filled or you need to be logged in!')
        }
    }

    //Adding a vote
    $scope.addVote = function (post) {
        //Increment the number
        post.votes++;
        //Save to the Firebase
        Posts.$save(post);
    }

    //Deleting a post
    $scope.deletePost = function (post) {
        //Getting the right URL
        var postForDeletion = new Firebase('https://unknown-chat.firebaseio.com/' + post.$id);
        //Removing it from Firebase
        postForDeletion.remove();
    }

    $scope.addComment = function (post, comment) {
        if ($scope.authData) {
            var ref = new Firebase('https://unknown-chat.firebaseio.com/' + post.$id + '/comments');
            var sync = $firebase(ref);
            $scope.comments = sync.$asArray();
            $scope.comments.$add({
                user: $scope.authData.twitter.username,
                text: comment.text
            });
        } else {
            alert('You need to be logged in before doing that!')
        }
        
        comment.text = "";
    }
    
    $scope.removeComment = function(post, comment) {
        var commentForDeletion = new Firebase('https://unknown-chat.firebaseio.com/' + post.$id + '/comments/' + comment.$id);
        commentForDeletion.remove();
    }

    //Logging the user in
    $scope.login = function () {
        //Creating a refrence URL with Firebase
        var ref = new Firebase('https://unknown-chat.firebaseio.com/');
        //Doing the OAuth popup
        ref.authWithOAuthPopup('twitter', function (error, authData) {
            //If there is an error
            if (error) {
                alert('Sorry bro, there was an error.');
            }
            //If the user is logged in correctly
            else {
                alert('You were logged in successfully.');
            }
            //Set the authData we get to a global variable that can be used
            $scope.authData = authData;
        });
    }
});