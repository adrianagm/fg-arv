/**
 * Module with several utility functions.
 */
(function() {

  "use strict";

  define(function() {

    var utils = {
      //------------------------------------------------------------------------------------------------------------------------------
      /**
       * Checks is a specific value is a function or not.
       *
       * @param value Value to check.
       * @returns {boolean} 'true' is the value is a function, 'false' otherwise;
       */
      isFunction: function(value) {
        if (value) {
          return typeof value === 'function';
        }
        return false;
      },

      //------------------------------------------------------------------------------------------------------------------------------
      /**
       * Checks is a specific value is a date or not.
       *
       * @param value Value to check.
       * @returns {boolean} 'true' is the value is a date, 'false' otherwise;
       */
      isDate: function(value) {
        return value instanceof Date;
      },

      isAfterToday: function(value) {
        if (utils.isDate(value)) {
          var tomorrow = new Date().add(1).days();
          return value.getTime() >= tomorrow.getTime();
        }
        return false;
      },
      //------------------------------------------------------------------------------------------------------------------------------
      /**
       * Checks if an object has a particular property and such property has a 'defined' value.
       * @param obj Any object.
       * @param {string} propertyName The name of the property to be checked.
       * @returns {boolean} true if the object has the property and the property value is not 'undefined', false otherwise.
       */
      isPropertyDefined: function(obj, propertyName) {
        return obj && propertyName && obj.hasOwnProperty(propertyName) && typeof obj[propertyName] != 'undefined';
      },

      //------------------------------------------------------------------------------------------------------------------------------
      /**
       * Returns a property value if the object has that property a its value is defined, null otherwise.
       * @param obj Any object.
       * @param {string} propertyName The name of the property from which to obtain the value.
       * @returns The property value if the object has that property a its value is defined, null otherwise.
       */
      getPropertyValue: function(obj, propertyName) {
        if (this.isPropertyDefined(obj, propertyName)) {
          return obj[propertyName];
        }
        return null;
      },

      isString: function(value) {
        return typeof(value) === 'string' || value instanceof String;
      },
      //------------------------------------------------------------------------------------------------------------------------------
      createEventBus: function(data) {
        var eventHandlers = {};
        var eventBus = {
          getData: function() {
            return data;
          },
          addHandler: function(eventName, callbackFunction) {
            var handlers = utils.getPropertyValue(eventHandlers, eventName);
            if (!handlers) {
              eventHandlers[eventName] = [];
            }
            if (eventHandlers[eventName].indexOf(callbackFunction) < 0) {
              eventHandlers[eventName].push(callbackFunction);
            }
            return this;
          },
          removeHandler: function(eventName, callbackFunction) {
            var handlers = utils.getPropertyValue(eventHandlers, eventName);
            if (handlers && handlers.length > 0) {
              var index = eventHandlers[eventName].indexOf(callbackFunction);
              if (index > -1) {
                eventHandlers[eventName].splice(index, 1);
              }
            }
            return this;
          },
          trigger: function() {
            if (arguments && arguments.length > 0) {
              var eventName = arguments[0];
              var handlers = utils.getPropertyValue(eventHandlers, eventName);
              if (handlers && handlers.length > 0) {
                var args = [];
                for (var x = 1; x < arguments.length; x++) {
                  args.push(arguments[x]);
                }
                var context = {
                  eventBus: eventBus,
                  eventName: eventName
                };
                args.push(context);
                jQuery.each(handlers, function(index, handler) {
                  return handler.apply(handler, args);
                });
              }
            }
          }
        };
        return eventBus;
      }
    };

    return utils;
  });

})();