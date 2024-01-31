/**
 * Promise constructor
 * @param {*} executor
 */
function Promise(executor) {
  var self = this;

  self.status = 'pending'; // Promise 当前的状态
  self.data = undefined; // Promise 的值
  self.onResolvedCallback = []; // Promise resolve 时的回到函数集，可能有多个回调
  self.onRejectedCallback = []; // Promise reject 时的回到函数集，可能有多个回调

  executor(resolve, reject);
}
