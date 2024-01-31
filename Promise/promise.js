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
  var newPromise;

  // 根据标准，如果 then 的参数不是 function，则我们需要忽略它，此处以如下方式处理
  onResolved = typeof onResolved === 'function' ? onResolved : function (v) {};
  onRejected = typeof onRejected === 'function' ? onRejected : function (r) {};

  switch (self.status) {
    case 'resolved':
      return (newPromise = new Promise(function (resolve, reject) {}));
    case 'rejected':
      return (newPromise = new Promise(function (resolve, reject) {}));
    case 'pending':
      return (newPromise = new Promise(function (resolve, reject) {}));
  }
};
