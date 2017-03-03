var ready = function() {
  window.onpopstate = function() {
    fullLoader();
    location.reload();
  }


  // initialLocationScript();

  var hash = window.location.hash;
  if (hash === '') {
    fullLoader();
    initialLocation();
  } else {
    fullLoader();
    handleLoad(parseHashString(hash))
    removeHash()
  }
};

$(".application.index").ready(ready);
$(document).on('page:change', ready);


function parseHashString(hash) {
  strData = hash.match(/[^#]*\w/);
  data = strData[0].split('/');
  var locationName = data[0].replace(/%20/g, " ");
  data = data[1].split(',');
  var lat = data[0];
  var lng = data[1];
  return {lat: lat, lng: lng, locationName: locationName}
}
function removeHash () { 
    history.pushState("", document.title, window.location.pathname
                                                       + window.location.search);
}


function handleLoad(locationData) {
  handleWeatherLoad(locationData);
  // handleHistoricForecastLoad(locationData);
}



function handleHistoricForecastLoad(locationData) {
  fetchHistoricForecastData(locationData).done(showHistoric).fail(renderHistoricError);
}

function fetchHistoricForecastData(locationData) {
  return $.ajax({
    url: '/historic',
    data: {coord_data: locationData},
    method: 'POST'
  });
}

function showHistoric(weatherData) {

    // Set SVG elements 
    // --------------------------------------
     
    // Set the dimensions of the canvas / graph
    var margin = {top: 30, right: 20, bottom: 30, left: 50},
        width = 650 - margin.left - margin.right,
        height = 250 - margin.top - margin.bottom;

    // Parse the date / time
    var parseDate = d3.time.format("%d-%b-%y").parse,
        formatDate = d3.time.format("%d-%b"),
        bisectDate = d3.bisector(function(d) { return d.date; }).left;


    // Set the ranges
    var x = d3.time.scale().range([0, width]);
    var y = d3.scale.linear().range([height, 0]);

    // Define the axes
    var xAxis = d3.svg.axis().scale(x)
        .orient("bottom").ticks(4);

    var yAxis = d3.svg.axis().scale(y)
        .orient("left").ticks(5);

    // Define the line
    var valueline = d3.svg.line()
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.temp); });

    // Adds the svg canvas
    var svg = d3.select("#graph")
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", 
                  "translate(" + margin.left + "," + margin.top + ")");

    // Tooltip
    var lineSvg = svg.append("g"); 
    var focus = svg.append("g") 
        .style("display", "none");




    // Get initial data
    // --------------------------------------

    // data variables
    var lineData = [],
        dataType = {},
        day = {};

        dataType['temperatureMax'] = [];
        dataType['temperatureMin'] = [];
        dataType['humidity'] = [];
        dataType['windSpeed'] = [];
        dataType['cloudCover'] = [];
        dataType['pressure'] = [];
        dataType['dewPoint'] = [];
        dataType['precipAccumulation'] = [];

        function replaceDataTypeName(type) {
          if (type === 'temperatureMax') {
            return 'Max Temperature';
          } else if (type === 'temperatureMin') {
            return 'Min Temperature';
          } else if (type === 'humidity') {
            return 'Humidity';
          } else if (type === 'windSpeed') {
            return 'Wind Speed';
          } else if (type === 'cloudCover') {
            return 'Cloud Cover';
          } else if (type === 'pressure') {
            return 'Pressure';
          } else if (type === 'dewPoint') {
            return 'Dew Point';
          } else if (type === 'precipAccumulation') {
            return 'Precipitation Accumulation';
          } 
        }



        // step through each day
        weatherData.forEach(function(d) {

          Object.keys(dataType).forEach(function(type) {
            dataType[type].push({date: new Date(d.date), temp: d[type]})
          });

        });
        
        lineData = dataType['temperatureMax'];

        // Scale the range of the data
        x.domain(d3.extent(lineData, function(d) { return d.date; }));
        y.domain([0, d3.max(lineData, function(d) { return d.temp * 1.2; })]);

        // Add the valueline path.
        lineSvg.append("path")
            .attr("class", "line")
            .attr("d", valueline(lineData));

        // Add the X Axis
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        // Add the Y Axis
        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis);

       // append the y tooltip
        focus.append("line")
            .attr("class", "y-tip")
            .attr("y1", 0)
            .attr("y2", height);

        // append the x tooltip
        focus.append("line")
            .attr("class", "x-tip")
            .attr("x1", width)
            .attr("x2", width);

        // append the circle at the intersection
        focus.append("circle")
            .attr("class", "y")
            .style("fill", "none")
            .style("stroke", "blue")
            .attr("r", 4);

        // place the value at the intersection
        focus.append("text")
            .attr("class", "y1")
            .style("stroke", "white")
            .style("stroke-width", "3.5px")
            .style("opacity", 0.8)
            .attr("dx", 8)
            .attr("dy", "-.3em");
        focus.append("text")
            .attr("class", "y2")
            .attr("dx", 8)
            .attr("dy", "-.3em");

        // place the date at the intersection
        focus.append("text")
            .attr("class", "y3")
            .style("stroke", "white")
            .style("stroke-width", "3.5px")
            .style("opacity", 0.8)
            .attr("dx", 8)
            .attr("dy", "1em");
        focus.append("text")
            .attr("class", "y4")
            .attr("dx", 8)
            .attr("dy", "1em");
        
        // append the rectangle to capture mouse
        svg.append("rect")
            .attr("width", width)
            .attr("height", height)
            .style("fill", "none")
            .style("pointer-events", "all")
            .on("mouseover", function() { focus.style("display", null); })
            .on("mouseout", function() { focus.style("display", "none"); })
            .on("mousemove", mousemove);

        function mousemove() {
            var x0 = x.invert(d3.mouse(this)[0]),
                i = bisectDate(lineData, x0, 1),
                d0 = lineData[i - 1],
                d1 = lineData[i],
                d = x0 - d0.date > d1.date - x0 ? d1 : d0;

            focus.select("circle.y")
                .attr("transform",
                      "translate(" + x(d.date) + "," +
                                     y(d.temp) + ")");

            focus.select("text.y1")
                .attr("transform",
                      "translate(" + x(d.date) + "," +
                                     y(d.temp) + ")")
                .text(d.temp);

            focus.select("text.y2")
                .attr("transform",
                      "translate(" + x(d.date) + "," +
                                     y(d.temp) + ")")
                .text(d.temp);

            focus.select("text.y3")
                .attr("transform",
                      "translate(" + x(d.date) + "," +
                                     y(d.temp) + ")")
                .text(formatDate(d.date));

            focus.select("text.y4")
                .attr("transform",
                      "translate(" + x(d.date) + "," +
                                     y(d.temp) + ")")
                .text(formatDate(d.date));

            focus.select(".y-tip")
                .attr("transform",
                      "translate(" + x(d.date) + "," +
                                     y(d.temp) + ")")
                           .attr("y2", height - y(d.temp));

            focus.select(".x-tip")
                .attr("transform",
                      "translate(" + width * -1 + "," +
                                     y(d.temp) + ")")
                           .attr("x2", width + width);
        }


        function changeData(dataId) {
          lineData = dataType[dataId];
          console.log(lineData);

             // Scale the range of the data again 
            x.domain(d3.extent(lineData, function(d) { return d.date; }));
            y.domain([0, d3.max(lineData, function(d) { return d.temp * 1.2; })]);

        // Select the section we want to apply our changes to
        var svg = d3.select("body").transition();

        // Make the changes
            svg.select(".line")   // change the line
                .duration(750)
                .attr("d", valueline(lineData));

            svg.select(".x.axis") // change the x axis
                .duration(750)
                .call(xAxis);
            svg.select(".y.axis") // change the y axis
                .duration(750)
                .call(yAxis);
        }


        var graphTabs = '' +
            '<div class="card-tabs">' + 
              '<ul class="tabs tabs-fixed-width graph-links">';
              Object.keys(dataType).forEach(function(type) {

                graphTabs += '' +
                '<li id="' + type + '" class="tab"><a href="#">' + replaceDataTypeName(type) + '</a></li>'
              });
              graphTabs += '' +
              '</ul>' +
            '</div>';

        $('#graph').append(graphTabs)
        console.log($('.tab:first-of-type').addClass('active-tab'))

        $('.graph-links').on('click', 'li', function(event) {
          event.preventDefault();
          $(".tab").not(this).removeClass('active-tab');
          $(this).addClass('active-tab');
          changeData($(this).attr('id'));
          // if ($(this).attr('id') === 'maxTempData') {

          // } else if ($(this).attr('id') === 'minTempData') {

          // } else if ($(this).attr('id') === 'humidityData') {
            
          // } else if ($(this).attr('id') === 'windSpeedData') {
            
          // } else if ($(this).attr('id') === 'cloudCoverData') {
            
          // } else if ($(this).attr('id') === 'pressureData') {
            
          // } else if ($(this).attr('id') === 'dewPointData') {
            
          // } 
        });



  removeLoader();


}
function renderHistoricError() {
  console.log('error')
}



function handleWeatherLoad(locationData) {
  fetchWeatherData(locationData).done(showWeather).fail(renderWeatherError);
};

function fetchWeatherData(locationData) {
  return $.ajax({
    url: '/weather',
    data: {coord_data: locationData},
    method: 'POST'
  });
};

function showWeather(weatherData) {
  console.log(weatherData)
  $('.main').append(renderWeather(weatherData))
  renderSkyIcon(weatherData)
  handleHistoricForecastLoad(weatherData['geo_coordinates'])
  // removeLoader()
  
}

function renderWeather(weatherData) {
  // if (weatherData.flags.units === 'us') {
  //   var tempUnit = '°F'
  // }
  var weather = '' + 
  '<div class="weather-cont">' +
    '<div class="weather today-forecast">' +
      '<div class="card-panel today now">' +
        '<div class="icon-summary-cont">' +
          '<figure class="icons">' +
            '<div class="icon-cont">' +
              '<canvas id="0" class="icon-canvas" data-icon="' + weatherData.today.now.icon + '"></canvas>' +
            '</div>' +
            '<div class="temp">' + weatherData.today.now.temperature + '</div>' +
            '<div class="summary">' + weatherData.today.now.summary + '</div>' +
          '</figure>' +
          '<div class="summary-cont">' +
            '<h4 class="location">' + weatherData.today.now.location + '</h4>' +
            '<div class="time">' + weatherData.today.now.time + '</div>' +
            ( weatherData.today.precipType  !== null ?  '<div class="precipitation">' + weatherData.today.precipProbability + " of " + weatherData.today.precipType + '</div>' : "" ) +
            '<div class="apparent">Feels like: ' + weatherData.today.now.apparentTemperature + '</div>' +
            '<div class="hi-lo"><b>H </b> ' + weatherData.today.temperatureMax + ' @ ' + weatherData.today.temperatureMaxTime + '</div>' +
            '<div class="hi-lo"><b>L </b> ' + weatherData.today.temperatureMin + ' @ ' + weatherData.today.temperatureMinTime + '</div>' +
            '<div class="card-panel alerts-cont">Alerts: ' +
              '<ul class="alerts collection">';
              if (weatherData.alerts) {
                weatherData.alerts.forEach(function(alert) {
                  weather += '' +
                  '<li class="collection-item alert">' +
                    '<a class="alert-left" href="' + alert.uri + '">' + alert.title + '</a>' +
                    '<p class="alert-right">ends ' + alert.expires + '</p>' +
                  '</li>';
                });
              }
      weather += '' +
              '</ul>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="card-panel today misc">' +
        '<h4>Today</h4>' +
        '<div class="cloud-cover">Cloud Coverage: ' + weatherData.today.now.cloudCover + '</div>' +
        '<div class="humidity">Humidity: ' + weatherData.today.now.humidity + '</div>' +
        '<div class="wind-speed">Wind Speed: ' + weatherData.today.now.windSpeed + '</div>' +
        '<div class="wind-direction">Wind Bearing: ' + weatherData.today.now.windBearing + '°</div>' +
        '<div class="pressure">Pressure: ' + weatherData.today.now.pressure + '</div>' +
        '<div class="dew">Dew Point: ' + weatherData.today.now.dewPoint + '</div>' +
        '<div class="visibility">Visibility: ' + weatherData.today.now.visibility + '</div>' +
        '<div class="ozone">Ozone: ' + weatherData.today.ozone + '</div>' +
        // '<div class="moon-phase">Moon Phase: ' + weatherData.today.moonPhase + '</div>' +
        '<div class="sunrise">Sunrise: ' + weatherData.today.sunriseTime + '</div>' +
        '<div class="sunset">Sunset: ' + weatherData.today.sunsetTime + '</div>' +
      '</div>' +
      '<div class="card-panel today hours">' +
        '<h4>Hourly Forecast</h4>';
        for (var i=0; i < 10; i++) {
          weather += '' +
          '<div class="hours-cont">' +
            '<div class="hour-cont">' +
              '<p class="hour-time">' + weatherData.hours[i].time + ':</p>' +
              '<p class="hour-temp">' + weatherData.hours[i].temperature+ '</p>' +
            '</div>' +
              '<div class="icon-cont-hours">' +
                '<canvas id="' + i+1 + '" class="icon-canvas small" data-icon="' + weatherData.hours[i].icon + '"></canvas>' +
              '</div>' +
          '</div>';
        };
      weather += '' +
      '</div>' +
      '<div id="clear" style="clear:both;"></div>' +
    '</div>' +
    '<div class="weather weekly-forecast">';
      for (var i=0; i<7; i++) {
        weather += '' +
        '<div class="card-panel day">' + 
          '<div class="day-date">' + weatherData.future_days[i].time + '</div>' +
            '<div class="day-icon-cont">' +
              '<canvas id="' + i+10 + '" class="icon-canvas day-icon" data-icon="' + weatherData.future_days[i].icon + '"></canvas>' +
            '</div>' +
            '<div class="day-summary">' + weatherData.future_days[i].summary +  '</div>' +
            '<div class="day-temp">H ' + weatherData.future_days[i].temperatureMax + '</div>' +
            '<div class="day-temp">L ' + weatherData.future_days[i].temperatureMin + '</div>' +
            ( weatherData.future_days[i].precipType  !== null ? '<div class="day-precipitation">' + weatherData.future_days[i].precipProbability + ' - ' + weatherData.future_days[i].precipType + '</div>' : "" ) +
        '</div>';
      }
      // '<div class="weekly-summary">' + weatherData.daily.summary + '</div>' +
    weather += '' +
    '</div>' +
    '<div class="weather historic-data">' +
      '<div id="graph" class="card-panel"></div>' +
    '</div>' +
    '<div id="clear" style="clear:both;"></div>' +
  '</div>' +
  '';

  return weather;
};
function renderWeatherError() {
  console.log('error')
}

function renderSkyIcon(weatherData) {
  var skycons = new Skycons({"color": "black", "resizeClear": true});
  var icons = $('.icon-canvas');
  for (var i=0; i < icons.length; i++) {
    skycons.set($(icons[i]).attr('id'), $(icons[i]).data('icon'));
  }
  skycons.play();
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
