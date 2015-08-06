/**
 * This module is in charge of building the main widget structure for testing.
 */
(function() {

  "use strict";

  define(['fg-arv/components/mapView', 'fg-arv/google-helper', 'fg-arv/widget'], function(mapView, googleHelper, widget) {

    var rootElement = jQuery('#test-buttons');
    var date = new Date().addHours(4);

    rootElement.find("button.route1").click(function() {

      mapView.deleteRoute();

      var from = 'London';
      var to = 'Southampton';

      var opt = {
        departureTime: date,
        arrivalTime: false,
        departureDirection: from,
        arrivalDirection: to
      };

      googleHelper.getJourney(from, to, opt).done(function(response) {
          //FOR ROUTES
          jQuery.each(response, function(i, route) {
            mapView.createComponent({
              map: widget.getMap(),
              route: route
            });
          });
        })
        .fail(function() {
          //No routes
        });
    });

    rootElement.find("button.route2").click(function() {

      mapView.deleteRoute();

      var from = 'London';
      var to = 'Swindon';

      var opt = {
        departureTime: date,
        arrivalTime: false,
        departureDirection: from,
        arrivalDirection: to
      };

      googleHelper.getJourney(from, to, opt).done(function(response) {
          //FOR ROUTES
          jQuery.each(response, function(i, route) {
            mapView.createComponent({
              map: widget.getMap(),
              route: route
            });
          });
        })
        .fail(function() {
          //No routes
        });
    });

    rootElement.find("button.route3").click(function() {

      mapView.deleteRoute();

      var from = 'London';
      var to = 'Crawley';

      var opt = {
        departureTime: date,
        arrivalTime: false,
        departureDirection: from,
        arrivalDirection: to
      };

      googleHelper.getJourney(from, to, opt).done(function(response) {
          //FOR ROUTES
          jQuery.each(response, function(i, route) {
            mapView.createComponent({
              map: widget.getMap(),
              route: route
            });
          });
        })
        .fail(function() {
          //No routes
        });
    });

    rootElement.find("button.route4").click(function() {

      mapView.deleteRoute();

      var from = 'Bristol';
      var to = 'Southampton';

      var opt = {
        departureTime: date,
        arrivalTime: false,
        departureDirection: from,
        arrivalDirection: to
      };

      googleHelper.getJourney(from, to, opt).done(function(response) {
          //FOR ROUTES
          jQuery.each(response, function(i, route) {
            mapView.createComponent({
              map: widget.getMap(),
              route: route
            });
          });
        })
        .fail(function() {
          //No routes
        });
    });
  });
})();