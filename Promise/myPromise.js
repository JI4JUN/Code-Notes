var myPromise = (() => {
  function Promise(executor) {
    if (typeof executor !== 'function') {
      throw new TypeError('executor must be a function');
    }

    var self = this;
    self.callbacks = [];
    self.status = 'pending';

    function resolve(value) {
      setTimeout(() => {
        if (self.status !== 'pending') return;

        self.status = 'fulfilled';
        self.data = value;

        self.callbacks.forEach((cb) => cb.onResolved(value));
      });
    }

    function reject(reason) {
      setTimeout(() => {
        if (self.status !== 'pending') return;

        self.status = 'rejected';
        self.data = reason;

        self.callbacks.forEach((cb) => cb.onRejected(reason));
      });
    }

    try {
      executor(resolve, reject);
    } catch (err) {
      reject(err);
    }
  }

  function resolvePromise(promise, x, resolve, reject) {}

  Promise.prototype.then = (onFulfilled, onRejected) => {
    onFulfilled =
      typeof onFulfilled === 'function'
        ? onFulfilled
        : (value) => {
            return value;
          };
    onRejected =
      typeof onRejected === 'function'
        ? onRejected
        : (reason) => {
            throw reason;
          };

    var self = this;
    var promise2;

    switch (self.status) {
      case 'fulfilled': {
      }
      case 'rejected': {
      }
      case 'pending': {
      }
      default: {
        throw new TypeError('known status ' + self.status);
      }
    }
  };

  Promise.prototype.catch = (onRejected) => {};

  Promise.prototype.finally = (fn) => {};

  Promise.all = () => {};

  Promise.allSettled = () => {};

  Promise.any = () => {};

  Promise.race = () => {};

  Promise.allSettled = () => {};

  Promise.reject = () => {};

  Promise.resolve = () => {};

  Promise.withResolvers = () => {};

  try {
    // CommonJS compliance
    module.exports = Promise;
  } catch (e) {}

  return Promise;
})();
