$(".application.index").ready(function(){
  // handleInitialLocationLoad();

  // bindCreateTweetEvent();


  // initialLocation();


});



function initialLocation() {
  var options = {
    async: false,
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0
  };

  function success(pos) {
    var coords = {lat: pos.coords.latitude, lng: pos.coords.longitude}
    handleWeatherLoad(coords);
  };

  function error(err) {
    var coords = {lat: "41.8781", lng: "87.6298"}
    handleWeatherLoad(coords);
  };

  navigator.geolocation.getCurrentPosition(success, error, options);
};


function handleWeatherLoad(coords) {
  fetchWeatherData(coords).done(renderWeather).fail(renderWeatherError)
};

function fetchWeatherData(coords) {
  return $.ajax({
    url: '/weather',
    data: {coord_data: coords},
    method: 'POST'
  });
};

function renderWeather(weatherData) {
  console.log(weatherData)
  removeLoader();
};
function renderWeatherError() {
  console.log('error')
}





// function test(geoCoords) {
//   console.log(geoCoords);
// }



// function bindCreateTweetEvent(){
//   $('#tweet-form').on('submit', handleCreateTweetOnSubmit);
// }

// function handleCreateTweetOnSubmit(event){
//     event.preventDefault();
//     createTweet().done(function(response){
//       $('#tweet-river').prepend(renderTweet(response))
//     })

// }

// function createTweet(){
//   var data = $('#new-tweet').val()
//   var hashtags = data.match(/(#\w+)/g)
//   return $.ajax({
//     url: '/tweets',
//     data: {tweet: {content: data}, hashtags: hashtags},
//     method: 'POST'
//   });
// }


// function fetchLocation() {
//   return $.ajax({url:"/tweets/recent", method:"GET"})
// }

// function handleInitialLocationLoad() {
//   fetchLocation().done(showTweet)
// }

// function showTweet(tweetInfo) {
//   var sortedInfo = tweetInfo.sort(function(a, b){
//     return b.updated_at - a.updated_at
//   })
//   sortedInfo.forEach(function(tweet){
//     $('#tweet-river').append(renderTweet(tweet))
//   })
// }

// // ADD IF HAVE TIME
// // function addTweetToDom(tweet, placementOption){
// //   if (placementOption === "append"){
// //     $('#tweet-river').append(renderTweet(tweet))
// //   }else{
// //     $('#tweet-river').prepend(renderTweet(tweet))
// //   }
// // }

// function renderTweet(tweet){
//   return `
//     <li class="tweet">
//       <img class="avatar" src=${tweet.avatar_url} alt="">
//       <div class="tweet-content">
//         <p>
//           <span class="full-name">${tweet.username}</span>
//           <span class="username">${tweet.handle}</span>
//           <span class="timestamp">${jQuery.timeago(tweet.updated_at)}</span>
//           <span class="hashtags">${tweet.hashtag_names}</span>
//         </p>
//         <p>${tweet.content}</p>
//       </div>
//     </li>
//   `
// }

// function fetchHashtags(){
//   return $.ajax({url:"/hashtags/popular", method:"GET"})
// }

// function handleHashtagLoad(){
//   fetchHashtags().done(showHashtag)
// }

// function showHashtag(hashtagInfo){
//   var sortedInfo = hashtagInfo.sort(function(a, b){
//     return b.hashtag_count - a.hashtag_count
//   })
//   sortedInfo.forEach(function(hashtag){
//     $('#hashtags').append(renderHashtag(hashtag))
//   })
// }
// function renderHashtag(hashtag){
//   return `
//     <li>${hashtag.name}</li>
//   `
// }
