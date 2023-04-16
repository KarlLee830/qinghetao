let EventBusClass = {};

EventBusClass = function () {
  this.listeners = {};
};

EventBusClass.prototype = {
  addEventListener(type, callback, scope) {
    let args = [];
    const numOfArgs = arguments.length;
    for (let i = 0; i < numOfArgs; i++) {
      args.push(arguments[i]);
    }
    args = args.length > 3 ? args.splice(3, args.length - 1) : [];
    if (typeof this.listeners[type] !== 'undefined') {
      this.listeners[type].push({ scope, callback, args });
    } else {
      this.listeners[type] = [{ scope, callback, args }];
    }
  },
  removeEventListener(type, callback, scope) {
    if (typeof this.listeners[type] !== 'undefined') {
      const numOfCallbacks = this.listeners[type].length;
      const newArray = [];
      for (let i = 0; i < numOfCallbacks; i++) {
        const listener = this.listeners[type][i];
        if (listener.scope == scope && listener.callback == callback) {

        } else {
          newArray.push(listener);
        }
      }
      this.listeners[type] = newArray;
    }
  },
  hasEventListener(type, callback, scope) {
    if (typeof this.listeners[type] !== 'undefined') {
      const numOfCallbacks = this.listeners[type].length;
      if (callback === undefined && scope === undefined) {
        return numOfCallbacks > 0;
      }
      for (let i = 0; i < numOfCallbacks; i++) {
        const listener = this.listeners[type][i];
        if ((scope ? listener.scope == scope : true) && listener.callback == callback) {
          return true;
        }
      }
    }
    return false;
  },
  dispatch(type, target) {
    const event = {
      type,
      target,
    };
    let args = [];
    const numOfArgs = arguments.length;
    for (let i = 0; i < numOfArgs; i++) {
      args.push(arguments[i]);
    };
    args = args.length > 2 ? args.splice(2, args.length - 1) : [];
    args = [event].concat(args);


    if (typeof this.listeners[type] !== 'undefined') {
      const listeners = this.listeners[type].slice();
      const numOfCallbacks = listeners.length;
      for (let i = 0; i < numOfCallbacks; i++) {
        const listener = listeners[i];
        if (listener && listener.callback) {
          const concatArgs = args.concat(listener.args);
          listener.callback.apply(listener.scope, concatArgs);
        }
      }
    }
  },
  getEvents() {
    let str = '';
    for (const type in this.listeners) {
      const numOfCallbacks = this.listeners[type].length;
      for (let i = 0; i < numOfCallbacks; i++) {
        const listener = this.listeners[type][i];
        str += listener.scope && listener.scope.className ? listener.scope.className : 'anonymous';
        str += ` listen for '${type}'\n`;
      }
    }
    return str;
  },
};

const EventBus = new EventBusClass();

export default EventBus;
