/**
 * Promise constructor
 * @param {*} executor Promise 构造函数接收一个 executor 函数，executor 函数执行完同步或异步操作后，调用它的两个参数 resolve 和 reject
 */
function Promise(executor) {
  var self = this;

  self.status = 'pending'; // Promise 当前的状态
  self.onResolvedCallback = []; // Promise resolve 时的回到函数集，可能有多个回调
  self.onRejectedCallback = []; // Promise reject 时的回到函数集，可能有多个回调

  function resolve(value) {
    if (value instanceof Promise) {
      return value.then(resolve, reject);
    }

    setTimeout(() => {
      // 异步执行所有的回调函数
      if (self.status === 'pending') {
        self.status = 'resolved';
        self.data = value;
        for (var i = 0; i < self.onResolvedCallback.length; i++) {
          self.onResolvedCallback[i](value);
        }
      }
    });
  }

  function reject(reason) {
    setTimeout(() => {
      if ((self.status = 'rejected')) {
        self.status = 'rejected';
        self.data = reason;
        for (var i = 0; i < self.onRejectedCallback.length; i++) {
          self.onRejectedCallback[i](reason);
        }
      }
    });
  }

  try {
    // executor 有可能报错，若出错，则由 reject 进行处理
    executor(resolve, reject);
  } catch (e) {
    reject(e);
  }
}

/**
 * then 方法注册在这个 Promise 状态确定后的回调
 * @param {*} onResolved Promise 成功后的回调
 * @param {*} onRejected Promise 失败后的回调
 */
Promise.prototype.then = function (onResolved, onRejected) {
  var self = this;
  var promise2;

  // 根据标准，如果 then 的参数不是 function，则默认把值往后传或者抛
  onResolved =
    typeof onResolved === 'function'
      ? onResolved
      : function (value) {
          // 允许值的穿透
          return value;
        };
  onRejected =
    typeof onRejected === 'function'
      ? onRejected
      : function (reason) {
          return reason;
        };

  if (self.status === 'resolved') {
    // 如果promise1 (此处即为 this/self ) 的状态已经确定并且是 resolved，我们调用 onResolved
    // 因为考虑到有可能 throw，所以我们将其包在 try/catch 块里
    return (promise2 = new Promise(function (resolve, reject) {
      setTimeout(() => {
        try {
          var x = onResolved(self.data);
          resolvePromise(promise2, x, resolve, reject);
        } catch (reason) {
          reject(reason); // 如果出错，以捕获到的错误做为 promise2 的结果
        }
      });
    }));
  }

  // 和 status === 'resolved' 差不多
  if (self.status === 'rejected') {
    setTimeout(() => {
      return (promise2 = new Promise(function (resolve, reject) {
        try {
          var x = onRejected(self.data);
          resolvePromise(promise2, x, resolve, reject);
        } catch (reason) {
          reject(reason);
        }
      }));
    });
  }

  // 如果 promise1 的状态已经确定并且是 pending，我们将 onResolved 和 onRejected 注册到 onResolvedCallback 和 onRejectedCallback 中
  // 并返回一个新的 Promise 对象
  if (self.status === 'pending') {
    return (promise2 = new Promise(function (resolve, reject) {
      self.onResolvedCallback.push(function (value) {
        try {
          var x = onResolved(value);
          resolvePromise(promise2, x, resolve, reject);
        } catch (reason) {
          reject(reason);
        }
      });

      self.onRejectedCallback.push(function (reason) {
        try {
          var x = onRejected(reason);
          resolvePromise(promise2, x, resolve, reject);
        } catch (reason) {
          reject(reason);
        }
      });
    }));
  }
};

Promise.prototype.catch = function (onRejected) {
  return this.then(null, onRejected);
};

Promise.deferred = Promise.defer = function () {
  var dfd = {};
  dfd.promise = new Promise(function (resolve, reject) {
    dfd.resolve = resolve;
    dfd.reject = reject;
  });

  return dfd;
};

/**
 * resolvePromise 函数根据 x 的值来决定 promise2 的状态函数
 * @param {*} promise2 调用 then 方法返回的一个新的 Promise 对象
 * @param {*} x onResolved/onRejected 的返回值
 * @param {*} resolve
 * @param {*} reject
 */
function resolvePromise(promise2, x, resolve, reject) {
  var then;
  var thenCalledOrThrow = false; // If then has already been called or thrown

  if (promise2 === x) {
    // If promise and x refer to the same object, reject promise with a TypeError as the reason
    return reject(new TypeError('Chaining cycle detected for promise!'));
  }

  if (x instanceof Promise) {
    // If x is a promise, adopt its state
    if (x.status === 'pending') {
      // If x is a pending, promise must remain pending until x is fulfilled or rejected
      x.then(function (v) {
        resolvePromise(promise2, v, resolve, reject);
      }, reject);
    } else {
      // If x is fulfilled or rejected, fulfill or reject promise with the same value or reason
      x.then(resolve, reject);
    }

    return;
  }

  if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
    // If x is object or function, let then be x.then
    // avoids multiple accesses to the x.then property
    // for ensuring consistency in the face of an accessor property, whose value could change between retrievals
    try {
      then = x.then;
      if (typeof then === 'function') {
        then.call(
          x,
          function rs(y) {
            if (thenCalledOrThrow) return;
            thenCalledOrThrow = true;

            return resolvePromise(promise2, y, resolve, reject);
          },
          function rj(r) {
            if (thenCalledOrThrow) return;
            thenCalledOrThrow = true;

            return reject(r);
          }
        );
      } else {
        // If then is not a function, fulfill promise with x
        resolve(x);
      }
    } catch (e) {
      if (thenCalledOrThrow) return;
      thenCalledOrThrow = true;

      // If retrieving the property x.then results in an throw exception e, reject promise with e as the reason
      return reject(e);
    }
  } else {
    // If x is not a object or function, fulfill promise with x
    resolve(x);
  }
}

try {
  module.exports = Promise;
} catch (e) {}
