var map;
var Location = function(location){

  this.lat = location.lat;
  this.lng = location.lng;
  this.name = location.name;
  var self = this;
  var p = {lat:this.lat,lng:this.lng};

  this.marker = new google.maps.Marker({
    position: p,
    map: map,
    title:this.name
  });

  this.currentInfo = null;
  this.infowindow = new google.maps.InfoWindow({
    maxWidth: 150
  });


  var getinfo = function(map, marker){
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function() {
      marker.setAnimation(null);
    }, 1000);

    var wikiurl = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + marker.title + '&imlimit=5&format=json&callback=wikiCallback';
    $.ajax({
      url: wikiurl,
      dataType: 'jsonp'
    }).done(function(data) {
      var location_url = data[3][0];
      var location_descr = data[2][0];

      // Error handling for if no articles are returned from Wikipedia API

      if (!location_url) {
        self.infowindow.setContent('<div class="info">' + '<h3>' + marker.title + '</h3>' + '<p>' + 'Data Not found' + '</p>' + '</div>');
        self.infowindow.open(map, marker);
      }

      else {
        self.infowindow.marker = marker;
        self.infowindow.setContent('<div class="info">' + '<h3>' + marker.title + '</h3>' + '<p>' + location_descr + '<a href="' + location_url + '" target="blank">' + '..' + ' Read More' + '</a>' + '</p>' + '</div>');
        self.infowindow.open(map, marker);
        self.currentInfo = self.infowindow;
      }
    })

    .fail(function() {
      infowindow.setContent('<div class="info">' + '<h3>' + marker.title + '</h3>' + '<p>' + 'Data Not found' + '</p>' + '</div>');
      infowindow.open(map, marker);
    });
  };

  this.clicked = function(){
    google.maps.event.trigger(this.marker, 'click');
  };

  google.maps.event.addListener(this.marker, 'click', function() {
    getinfo(map, self.marker);
  });
};

function InitModel() {

  var styledMapType = new google.maps.StyledMapType(
    [
      {elementType: 'geometry', stylers: [{color: '#ebe3cd'}]},
      {elementType: 'labels.text.fill', stylers: [{color: '#523735'}]},
      {elementType: 'labels.text.stroke', stylers: [{color: '#f5f1e6'}]},
      {
        featureType: 'administrative',
        elementType: 'geometry.stroke',
        stylers: [{color: '#c9b2a6'}]
      },
      {
        featureType: 'administrative.land_parcel',
        elementType: 'geometry.stroke',
        stylers: [{color: '#dcd2be'}]
      },
      {
        featureType: 'administrative.land_parcel',
        elementType: 'labels.text.fill',
        stylers: [{color: '#ae9e90'}]
      },
      {
        featureType: 'landscape.natural',
        elementType: 'geometry',
        stylers: [{color: '#dfd2ae'}]
      },
      {
        featureType: 'poi',
        elementType: 'geometry',
        stylers: [{color: '#dfd2ae'}]
      },
      {
        featureType: 'poi',
        elementType: 'labels.text.fill',
        stylers: [{color: '#93817c'}]
      },
      {
        featureType: 'poi.park',
        elementType: 'geometry.fill',
        stylers: [{color: '#a5b076'}]
      },
      {
        featureType: 'poi.park',
        elementType: 'labels.text.fill',
        stylers: [{color: '#447530'}]
      },
      {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{color: '#f5f1e6'}]
      },
      {
        featureType: 'road.arterial',
        elementType: 'geometry',
        stylers: [{color: '#fdfcf8'}]
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry',
        stylers: [{color: '#f8c967'}]
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [{color: '#e9bc62'}]
      },
      {
        featureType: 'road.highway.controlled_access',
        elementType: 'geometry',
        stylers: [{color: '#e98d58'}]
      },
      {
        featureType: 'road.highway.controlled_access',
        elementType: 'geometry.stroke',
        stylers: [{color: '#db8555'}]
      },
      {
        featureType: 'road.local',
        elementType: 'labels.text.fill',
        stylers: [{color: '#806b63'}]
      },
      {
        featureType: 'transit.line',
        elementType: 'geometry',
        stylers: [{color: '#dfd2ae'}]
      },
      {
        featureType: 'transit.line',
        elementType: 'labels.text.fill',
        stylers: [{color: '#8f7d77'}]
      },
      {
        featureType: 'transit.line',
        elementType: 'labels.text.stroke',
        stylers: [{color: '#ebe3cd'}]
      },
      {
        featureType: 'transit.station',
        elementType: 'geometry',
        stylers: [{color: '#dfd2ae'}]
      },
      {
        featureType: 'water',
        elementType: 'geometry.fill',
        stylers: [{color: '#b9d3c2'}]
      },
      {
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [{color: '#92998d'}]
      }
    ],
    {name: 'Styled Map'});

    var blore = {lat: 12.9767, lng: 77.5713};
    map = new google.maps.Map(document.getElementById('map'), {
      zoom: 12,
      center: blore,
      mapTypeControlOptions: {
        mapTypeIds: ['roadmap', 'satellite', 'hybrid', 'terrain', 'styled_map']
      }
    });
    map.mapTypes.set('styled_map', styledMapType);
    map.setMapTypeId('styled_map');

    var self = this;

    this.allLocations = ko.observableArray([]);
    this.filteredLocation = ko.observable('');


    $.getJSON('locations.json')
    .done((places) => {
      locationList = places.locations;
      locationList.forEach((loc) => {
        var location = new Location(loc)
        this.allLocations.push(location);
      });
    });

    this.filteredLocations = ko.computed(function() {
      if(!self.filteredLocation()) {
        return self.allLocations();
      }

      else {
        return ko.utils.arrayFilter(self.allLocations(), function(loc) {

          if(loc.name.toLowerCase() == self.filteredLocation().toLowerCase()){
            loc.clicked();
            return true;
          }

          else{
            loc.infowindow.close();
            return false;
          }
        });
      }
    });
  }

  function startApp() {
    ko.applyBindings(new InitModel());
  }

  function closeNav() {
    document.getElementById("map").style.marginLeft= "0";
  }
