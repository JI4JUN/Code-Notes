let myPromise = (() => {
  function Promise(executor) {
    if (typeof executor !== 'function') {
      throw new TypeError('executor must be a function');
    }

    const self = this;
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
    let then;
    let thenCalledOrThrow = false;

    // if (promise === x)
    //   return reject(new TypeError('Chaining cycle detected for promise!'));

    if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
      try {
        then = x.then;
        if (typeof then === 'function') {
          then.call(
            x,
            (y) => {
              // then method's param onResolved
              if (thenCalledOrThrow) return;
              thenCalledOrThrow = true;

              return resolvePromise(promise, y, resolve, reject);
            },
            (r) => {
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

    const self = this;
    let promise2;

    switch (self.status) {
      case 'fulfilled': {
        return (promise2 = new Promise((resolve, reject) => {
          setTimeout(() => {
            try {
              let x = onFulfilled(self.data);
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
              let x = onRejected(self.data);
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
                let x = onFulfilled(value);
                resolvePromise(promise2, x, resolve, reject);
              } catch (err) {
                reject(err);
              }
            },
            onRejected: (reason) => {
              try {
                let x = onRejected(reason);
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

  Promise.prototype.catch = function (onRejected) {
    return this.then(null, onRejected);
  };

  Promise.prototype.finally = function (cb) {
    return this.then(
      (value) => Promise.resolve(cb()).then(() => value),
      (reason) =>
        Promise.resolve(cb()).then(() => {
          throw reason;
        })
    );
  };

  Promise.all = (promises) => {
    return new Promise((resolve, reject) => {
      let resolveCounter = 0;
      const promiseNum = promises.length;
      let resolvedValues = new Array(promiseNum);

      for (let i = 0; i < promiseNum; i++) {
        Promise.resolve(promises[i]).then(
          (value) => {
            resolvedValues[i] = value;
            resolveCounter++;
            if (resolveCounter === promiseNum) return resolve(resolvedValues);
          },
          (reason) => reject(reason)
        );
      }
    });
  };

  Promise.allSettled = (promises) => {
    return new Promise((resolve, _reject) => {
      let resolveCounter = 0;
      const promiseNum = promises.length;
      let resolvedValues = new Array(promiseNum);

      for (let i = 0; i < promiseNum; i++) {
        Promise.resolve(promises[i]).then((value) => {
          resolvedValues[i] = { status: 'fulfilled', value };
          resolveCounter++;
          if (resolveCounter === promiseNum) return resolve(resolvedValues);
        }),
          (reason) => {
            resolvedValues[i] = { status: 'rejected', reason };
            resolveCounter++;
            if (resolveCounter === promiseNum) return resolve(resolvedValues);
          };
      }
    });
  };

  Promise.any = (promises) => {
    return new Promise((resolve, reject) => {
      let resolveCounter = 0;
      const promiseNum = promises.length;

      for (let i = 0; i < promiseNum; i++) {
        Promise.resolve(promises[i]).then(
          (value) => resolve(value),
          (_reason) => {
            resolveCounter++;
            if (resolveCounter === promiseNum)
              reject(new AggregateError('All promises were rejected'));
          }
        );
      }
    });
  };

  Promise.race = (promises) => {
    return new Promise((resolve, reject) => {
      for (const promise of promises) {
        Promise.resolve(promise).then(
          (value) => resolve(value),
          (reason) => reject(reason)
        );
      }
    });
  };

  Promise.reject = (reason) => {
    return new Promise((_reslove, reject) => reject(reason));
  };

  Promise.resolve = (value) => {
    let promise;
    return (promise = new Promise((resolve, reject) => {
      resolvePromise(promise, value, resolve, reject);
    }));
  };

  Promise.deferred = Promise.defer = function () {
    let dfd = {};
    dfd.promise = new Promise(function (resolve, reject) {
      dfd.resolve = resolve;
      dfd.reject = reject;
    });

    return dfd;
  };

  module.exports = Promise;

  return Promise;
})();
