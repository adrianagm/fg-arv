(function() {

  "use strict";

  define(['fg-arv/constants', 'fg-arv/utils', 'fg-arv/templates', 'fg-arv/components/locationInput', 'fg-arv/components/datepicker', 'fg-arv/components/time', 'fg-arv/components/combobox', 'fg-arv/google-helper', 'fg-arv/components/mapView'],
    function(constants, utils, tmpl, locationInput, datepicker, time, combobox, googleHelper, mapView) {

      var mapInstance;

      var MapWidget = function(apiObject) {
        this.apiObject = apiObject;
        var rootElementID = apiObject.getDOMElementID();
        var rootElementSelector = "#" + rootElementID;
        var mapElementID = rootElementID + "-map";
        var mapElementSelector = "#" + mapElementID;
        var widget = this;
        var rootElement = jQuery(rootElementSelector);
        if (!rootElement || rootElement.length !== 1) {
          return undefined; // Abort!
        }
        this.widgetElement = jQuery(rootElementSelector)
          .html(tmpl.createWidgetTemplate(mapElementID)); // Insert HTML structure

        // ------- Options for Google Map -----------
        var mapOptions = {
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
        mapInstance = this.map;
        rootElement.find(".form").addClass('complete');

        var widget = this;

        var formControl = rootElement.find(".form")[0];
        jQuery(formControl).addClass('map-control');
        //this.map.controls[google.maps.ControlPosition.LEFT_TOP].push(formControl);

        google.maps.event.addListenerOnce(this.map, 'idle', function() {
          //rootElement.find('.map-control').show();
        });
        google.maps.event.addListener(this.map, 'zoom_changed', function() {
          google.maps.event.addListenerOnce(widget.map, 'idle', function() {
            widget.triggerEvent(constants.events.addNewMarkers);
          });
        });

        this.fromComponent = locationInput.createComponent({
          container: rootElement.find(".from-component"),
          placeholder: 'Where from?',
          classFromTo: 'from',
          title: 'Departure location.',
          focusCallback: function() {
            if (widget.focusedLocation == widget.toComponent) {
              widget.toComponent.blur();
            }

            widget.focusedLocation = widget.fromComponent;
          },
          changeCallback: function() {
            widget.triggerEvent(constants.events.locationChanged, {
              changedLocation: widget.fromComponent
            });
          }
        });

        this.toComponent = locationInput.createComponent({
          container: rootElement.find(".to-component"),
          placeholder: 'Where to?',
          classFromTo: 'to',
          title: 'Arrival location.',
          focusCallback: function() {
            if (widget.focusedLocation == widget.fromComponent) {
              widget.fromComponent.blur();
            }

            widget.focusedLocation = widget.toComponent;
          },
          changeCallback: function() {
            widget.triggerEvent(constants.events.locationChanged, {
              changedLocation: widget.toComponent
            });
          }
        });

        this.dateComponent = datepicker.createComponent({
          container: rootElement.find(".fg-arv_date-component"),
          changeCallback: function(newDate) {
            widget.triggerEvent(constants.events.dateChanged, newDate);
          }
        });

        this.criteriaComponent = combobox.createComponent({
          container: rootElement.find(".fg-arv_criteria-component"),
          type: "codedValues",
          options: [{
            text: "Fastest",
            travelMode: ''
          }, {
            text: "Fewer transfers",
            travelMode: ''
          }, {
            text: "Less walking",
            travelMode: ''
          }]
        });

        var eventBus = utils.createEventBus();

        // ------- The widget model object -----------
        jQuery.extend(this, {
          elementID: rootElementID,
          elementSelector: rootElementSelector,
          apiObject: apiObject,
          /**
           * Adds a listener for an events
           * @param eventName {string}  The event's name. Take it from constants module's events enumerate.
           * @param callback {function} The listener to be removed.
           */
          addEventHandler: eventBus.addHandler,
          /**
           * Removes a listener for an events
           * @param eventName {string}  The event's name. Take it from constants module's events enumerate.
           * @param callback {function} The listener to be removed.
           */
          removeEventHandler: eventBus.removeHandler,
          /**
           * Triggers a listener for an events
           * @param eventName {string}  The event's name. Take it from constants module's events enumerate.
           * @param callback {any} They payload for the event.
           */
          triggerEvent: eventBus.trigger
        });
        this.timeComponent = time.createComponent({
          getWidget: function() {
            return widget;
          },
          container: rootElement.find(".fg-arv_time-component"),
          date: this.dateComponent.getDate()
        });
        widget.reinitialise(apiObject);
        var from = widget.fromComponent.getValue().name;
        var to = widget.toComponent.getValue().name;
        var dateDeparture = widget.dateComponent.getDate();
        var timeDeparture = widget.timeComponent;
        var travelDate = new Date(dateDeparture.getFullYear(), dateDeparture.getMonth(), dateDeparture.getDate(), timeDeparture.getHours(), timeDeparture.getMinutes());

        var opt = {
          departureTime: utils.isDate(travelDate) ? travelDate : false,
          arrivalTime: false,
          departureDirection: from,
          arrivalDirection: to
        };

        googleHelper.getJourney(from, to, opt).done(function(response) {
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
      };


      jQuery.extend(MapWidget.prototype, {
        getFocusedLocation: function() {
          return this.focusedLocation;
        },
        getMap: function() {
          return this.map;
        },
        reinitialise: function(apiObject) {
          var rootElement = jQuery(this.elementSelector);
          if (rootElement) {
            var formValues = this._getAPIObjectValue(apiObject, 'getInitialFormValues');
            if (formValues) {
              var setFunction = function(key) {
                var value = utils.getPropertyValue(formValues, key);
                return value !== null ? value : '';
              };
              this.timeComponent.setValue(setFunction("time"));
              this.fromComponent.setValue(utils.getPropertyValue(formValues, 'from'));
              this.toComponent.setValue(utils.getPropertyValue(formValues, 'to'));
              var date = utils.getPropertyValue(formValues, 'date');
              if (date) {
                this.dateComponent.setDate(date);
              }
            }
          }
          // TODO Reinitialise the widget
        },
        close: function() {
          // TODO Free any resource and close.
        },
        //------------------------------------------------------------------------------------------------------------------------------
        /**
         * Returns a property value from the API Object. If the object returned by de the API Object was a function,
         * the final returned value would be the one resulted from the invocation to such a function,
         * otherwise the object will be returned as it was. Nevertheless, if the property was not defined or the value was 'undefined',
         * 'null' would be returned.
         *
         * @param apiObject The API Object.
         * @param {string} propertyName The name of the property from which to obtain the value.
         */
        _getAPIObjectValue: function(apiObject, propertyName) {
          var value = utils.getPropertyValue(apiObject, propertyName);
          if (value !== null) {
            if (utils.isFunction(value)) {
              return value();
            } else if (typeof value !== 'undefined') {
              return value;
            }
          }
          return null;
        }
      });

      var module = {
        createWidget: function(apiObject) {
          return new MapWidget(apiObject);
        },
        getMap: function() {
          return mapInstance;
        }
      };

      return module;

    });
})();