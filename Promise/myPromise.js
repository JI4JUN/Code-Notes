var myPromise = (() => {
  function Promise(executor) {
    if (typeof executor !== 'function') {
      throw new TypeError('executor must be a function');
    }

    var self = this;
    self.callbacks = [];
    self.status = 'pending';

    function resolve(value) {}

    function reject(reason) {}

    try {
      executor(resolve, reject);
    } catch (err) {
      reject(err);
    }
  }

  function resolvePromise(promise, x, resolve, reject) {}

  Promise.prototype.then = (resolve, reject) => {};

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
