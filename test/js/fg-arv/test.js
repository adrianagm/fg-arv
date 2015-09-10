/**
 * This module is in charge of building the main widget structure for testing.
 */
(function() {

  "use strict";
  var COLORS = ['#BE81F7', '#48b5e9', '#81F7BE', '#FA5882', '#FACC2E', '#04B4AE', '#F79F81', '#8181F7', '#5FB404'];
  define(['fg-arv/components/mapView', 'fg-arv/google-helper', 'fg-arv/widget', 'fg-arv/components/journeys'], function(mapView, googleHelper, widget, journeys) {

    var rootElement = jQuery('#test-buttons');
    var date = new Date().addHours(4);


    rootElement.find("button.route1").click(function() {

      //mapView.deleteRoute();

      var from = 'London';
      var to = 'Southampton';

      var opt = {
        departureTime: date,
        arrivalTime: false,
        departureDirection: from,
        arrivalDirection: to
      };

      widget.getJourney(from, to, opt);
    });

    rootElement.find("button.route2").click(function() {

      mapView.deleteRoute();

      var from = 'Lancaster Gate, London';
      var to = 'Bristol';

      var opt = {
        departureTime: date,
        arrivalTime: false,
        departureDirection: from,
        arrivalDirection: to
      };

      getJourney(from, to, opt);
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

      getJourney(from, to, opt);

    });

    rootElement.find("button.route4").click(function() {

      mapView.deleteRoute();

      var from = 'Reading';
      var to = 'Southampton';

      var opt = {
        departureTime: date,
        arrivalTime: false,
        departureDirection: from,
        arrivalDirection: to
      };

      getJourney(from, to, opt);

    });

    function getJourney(from, to, opt) {

      googleHelper.getJourney(from, to, opt).done(function(response) {
        var mapViewComponent = mapView.createComponent({
          map: widget.getMap(),
          routes: response,
          colors: COLORS,
          widgetElement: jQuery('#fg-arv-element')

        });
        journeys.createComponent({
          container: rootElement.find(
            '.fg-arv_info-journey-component'
          )[0],
          routes: response,
          widget: widget,
          departureTime: opt.departureTime ?
            opt.departureTime : false,
          arrivalTime: opt.arrivalTime ?
            opt.arrivalTime : false,
          departureDirection: opt
            .departureDirection,
          arrivalDirection: opt.arrivalDirection,
          mapViewComponent: mapViewComponent,
          colors: COLORS,
          message: 'Ooops! We are having problems with the route for improvement works. We estimate will be resolved in four days'
        });
      })
        .fail(function() {
          //No routes
        });

    }
  });


})();
