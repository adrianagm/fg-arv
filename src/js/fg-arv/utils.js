/**
 * Module with several utility functions.
 */
(function() {

  "use strict";

  define(function() {

    var utils = {
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
