/**
 * Promise constructor
 * @param {*} executor Promise 构造函数接收一个 executor 函数，executor 函数执行完同步或异步操作后，调用它的两个参数 resolve 和 reject
 */
function Promise(executor) {
  var self = this;

  self.status = 'pending'; // Promise 当前的状态
  self.data = undefined; // Promise 的值
  self.onResolvedCallback = []; // Promise resolve 时的回到函数集，可能有多个回调
  self.onRejectedCallback = []; // Promise reject 时的回到函数集，可能有多个回调

  function resolve(value) {
    if (self.status === 'pending') {
      self.status = 'resolved';
      self.data = value;
      for (var i = 0; i < self.onResolvedCallback.length; i++) {
        self.onResolvedCallback[i](value);
      }
    }
  }

  function reject(reason) {
    if ((self.status = 'rejected')) {
      self.status = 'rejected';
      self.data = reason;
      for (var i = 0; i < self.onRejectedCallback.length; i++) {
        self.onRejectedCallback[i](reason);
      }
    }
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

  // 根据标准，如果 then 的参数不是 function，则我们需要忽略它，此处以如下方式处理
  onResolved = typeof onResolved === 'function' ? onResolved : function (v) {};
  onRejected = typeof onRejected === 'function' ? onRejected : function (r) {};

  switch (self.status) {
    // 如果promise1 (此处即为 this/self ) 的状态已经确定并且是 resolved，我们调用 onResolved
    // 因为考虑到有可能 throw，所以我们将其包在 try/catch 块里
    case 'resolved':
      return (promise2 = new Promise(function (resolve, reject) {
        try {
          var x = onResolved(self.data);
          if (x instanceof Promise) {
            // 如果 onResolved 的返回值是一个 Promise 对象，直接取它的结果做为 promise2 的结果
            x.then(resolve, reject);
          }
        } catch (e) {
          reject(e); // 如果出错，以捕获到的错误做为 promise2 的结果
        }
      }));

    // 和 status === 'resolved' 差不多
    case 'rejected':
      return (promise2 = new Promise(function (resolve, reject) {
        try {
          var x = onRejected(self.data);
          if (x instanceof Promise) {
            x.then(resolve, reject);
          }
        } catch (e) {
          reject(e);
        }
      }));

    // 如果 promise1 的状态已经确定并且是 pending，我们将 onResolved 和 onRejected 注册到 onResolvedCallback 和 onRejectedCallback 中
    // 并返回一个新的 Promise 对象
    case 'pending':
      return (promise2 = new Promise(function (resolve, reject) {
        self.onResolvedCallback.push(function (value) {
          try {
            var x = onResolved(self.data);
            if (x instanceof Promise) {
              x.then(resolve, reject);
            }
          } catch (e) {
            reject(e);
          }
        });

        self.onRejectedCallback.push(function (value) {
          try {
            var x = onRejected(self.data);
            if (x instanceof Promise) {
              x.then(resolve, reject);
            }
          } catch (e) {
            reject(e);
          }
        });
      }));
  }
};

Promise.prototype.catch = function (onRejected) {
  return this.then(null, onRejected);
};
