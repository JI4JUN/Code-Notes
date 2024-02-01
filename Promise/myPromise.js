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

  function resolvePromise(promise, x, resolve, reject) {
    var then;
    var thenCalledOrThrow = false;

    if (promise === x)
      return reject(new TypeError('Chaining cycle detected for promise!'));

    if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
      try {
        then = x.then;
        if (typeof then === 'function') {
          then.call(
            x,
            function (y) {
              // then method's param onResolved
              if (thenCalledOrThrow) return;
              thenCalledOrThrow = true;

              return resolvePromise(promise, y, resolve, reject);
            },
            function (r) {
              // then method's param onRejected
              if (thenCalledOrThrow) return;
              thenCalledOrThrow = true;

              return reject(r);
            }
          );
        } else {
          return resolve(x);
        }
      } catch (err) {
        if (thenCalledOrThrow) return;
        thenCalledOrThrow = true;

        return reject(err);
      }
    } else {
      resolve(x);
    }
  }

  Promise.prototype.then = function (onFulfilled, onRejected) {
    onFulfilled =
      typeof onFulfilled === 'function' ? onFulfilled : (value) => value;
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
        return (promise2 = new Promise((resolve, reject) => {
          setTimeout(() => {
            try {
              var x = onFulfilled(self.data);
              resolvePromise(promise2, x, resolve, reject);
            } catch (err) {
              reject(err);
            }
          });
        }));
      }
      case 'rejected': {
        return (promise2 = new Promise((resolve, reject) => {
          setTimeout(() => {
            try {
              var x = onRejected(self.data);
              resolvePromise(promise2, x, resolve, reject);
            } catch (err) {
              reject(err);
            }
          });
        }));
      }
      case 'pending': {
        return (promise2 = new Promise((resolve, reject) => {
          self.callbacks.push({
            onResolved: (value) => {
              try {
                var x = onFulfilled(value);
                resolvePromise(promise2, x, resolve, reject);
              } catch (err) {
                reject(err);
              }
            },
            onRejected: (reason) => {
              try {
                var x = onRejected(reason);
                resolvePromise(promise2, x, resolve, reject);
              } catch (err) {
                reject(err);
              }
            }
          });
        }));
      }
      default: {
        throw new TypeError('known status ' + self.status);
      }
    }
  };

  // Promise.prototype.catch = (onRejected) => {};

  // Promise.prototype.finally = (fn) => {};

  // Promise.all = () => {};

  // Promise.allSettled = () => {};

  // Promise.any = () => {};

  // Promise.race = () => {};

  // Promise.allSettled = () => {};

  // Promise.reject = () => {};

  // Promise.resolve = () => {};

  // Promise.withResolvers = () => {};

  Promise.deferred = Promise.defer = function () {
    var dfd = {};
    dfd.promise = new Promise(function (resolve, reject) {
      dfd.resolve = resolve;
      dfd.reject = reject;
    });

    return dfd;
  };

  try {
    // CommonJS compliance
    module.exports = Promise;
  } catch (e) {}

  return Promise;
})();
