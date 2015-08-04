(function() {

  "use strict";

  define(['fg-arv/utils', 'fg-arv/templates'],
    function(utils, tmpl) {

      var MapWidget = function(apiObject) {
        this.apiObject = apiObject;
        var rootElementID = apiObject.getDOMElementID();
        var rootElementSelector = "#" + rootElementID;
        var mapElementID = rootElementID + "-map";
        var mapElementSelector = "#" + mapElementID;
        var center;
        var widget = this;
        center = apiObject.getCurrentUserLocation();
        var rootElement = jQuery(rootElementSelector);
        if (!rootElement || rootElement.length !== 1) {
          return undefined; // Abort!
        }
        this.widgetElement = jQuery(rootElementSelector)
          .html(tmpl.createWidgetTemplate(mapElementID)); // Insert HTML structure

        // ------- Options for Google Map -----------
        var mapOptions = {
          center: new google.maps.LatLng(center.lat, center.lng),
          zoom: 11,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          mapTypeControl: false,
          zoomControl: true,
          zoomControlOptions: {
            style: google.maps.ZoomControlStyle.SMALL,
            position: google.maps.ControlPosition.RIGHT_BOTTOM
          },
          scaleControl: false,
          panControl: false,
          streetViewControl: false,
          overviewMapControl: false
        };


        this.map = new google.maps.Map(jQuery(mapElementSelector)[0], mapOptions);



      };

      var module = {
        createWidget: function(apiObject) {
          return new MapWidget(apiObject);
        }
      };

      return module;

    });
})();