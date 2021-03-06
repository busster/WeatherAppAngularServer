


function initialLocation() {
  var options = {
    async: false,
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0
  };

  function success(pos) {
    return $.ajax({
      url: 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + pos.coords.latitude + ',' + pos.coords.longitude + '&key=AIzaSyCZoccc4EfWOS2RWrYoqcFcS64lU4pnXXU',
      method: 'GET'
    }).done(function(res) {
      var coords = {lat: pos.coords.latitude, lng: pos.coords.longitude, locationName: res.results[2]['address_components'][1]['long_name']}
      handleWeatherLoad(coords);
    }).fail(function() {

    });
  };

  function error(err) {
    console.log(err)
    var coords = {lat: "41.8781", lng: "-87.6298", locationName: "Chicago"}
    handleLoad(coords);
  };

  navigator.geolocation.getCurrentPosition(success, error, options);
};



function initialLocationScript() {
  jQuery(function(){
  if(!window.google||!window.google.maps){
      var script = '<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCZoccc4EfWOS2RWrYoqcFcS64lU4pnXXU&libraries=places&callback=initAutocomplete" async defer></script>'
      $('body').prepend(script);
  }
  else{
    initialize();
  }});
}


function logSearch(locationData) {
  return $.ajax({
    url: '/search',
    data: {coord_data: locationData},
    method: 'POST'
  });
}




var placeSearch, autocomplete;
var componentForm = {
  street_number: 'short_name',
  route: 'long_name',
  locality: 'long_name',
  administrative_area_level_1: 'short_name',
  country: 'long_name',
  postal_code: 'short_name'
};

function initAutocomplete() {
  // Create the autocomplete object, restricting the search to geographical
  // location types.
  autocomplete = new google.maps.places.Autocomplete(
      /** @type {!HTMLInputElement} */(document.getElementById('search')),
      {types: ['geocode']});

  // When the user selects an address from the dropdown, populate the address
  // fields in the form.
  autocomplete.addListener('place_changed', fillInAddress);
}

function fillInAddress() {
  // Get the place details from the autocomplete object.
  var place = autocomplete.getPlace();
  if (place.geometry !== undefined) {

    var lat = place.geometry.location.lat()
    var lng = place.geometry.location.lng();
    var coords = {lat: lat, lng: lng, locationName: place.name};

    logSearch(coords);
    // function in weather.js
    smallLoader();
    $('.weather-cont').remove();
    handleWeatherLoad(coords);

  } else {
    console.log(place)
    return $.ajax({
      url: 'https://maps.googleapis.com/maps/api/geocode/json?address=' + place.name + '&key=AIzaSyCZoccc4EfWOS2RWrYoqcFcS64lU4pnXXU',
      method: 'GET'
    }).done(function(res) {
      console.log(res)
      if (res.status !== "ZERO_RESULTS") {
        var coordPoint = res.results[0].geometry.location;
        var name = res.results[0].address_components[0].long_name;
        var coords = {lat: coordPoint.lat, lng: coordPoint.lng, locationName: name}
        logSearch(coords);
        smallLoader();
        $('.weather-cont').remove();
        handleWeatherLoad(coords);
      } else {
        $('body').prepend('<p class="alert alert-danger">I didn\'t seem to find anything. Try selecting a place from the populated list as you type.</p>')
        removeAlert();
      }
    }).fail(function() {
      console.log('nothing')
    });


  }
  // console.log(place.geometry.location.lat() + ", " + place.geometry.location.lng())
  // for (var component in componentForm) {
  //   document.getElementById(component).value = '';
  //   document.getElementById(component).disabled = false;
  // }

  // // Get each component of the address from the place details
  // // and fill the corresponding field on the form.
  // for (var i = 0; i < place.address_components.length; i++) {
  //   var addressType = place.address_components[i].types[0];
  //   if (componentForm[addressType]) {
  //     var val = place.address_components[i][componentForm[addressType]];
  //     document.getElementById(addressType).value = val;
  //   }
  // }
}

// Bias the autocomplete object to the user's geographical location,
// as supplied by the browser's 'navigator.geolocation' object.
function geolocate() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var geolocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      var circle = new google.maps.Circle({
        center: geolocation,
        radius: position.coords.accuracy
      });
      autocomplete.setBounds(circle.getBounds());
    });
  }
}