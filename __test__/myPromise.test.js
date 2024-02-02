const Promise = require('../Promise/myPromise.js');

/************************ Test Promise.prototype.then ************************/
const p1 = new Promise((resolve, _reject) => {
  resolve('Success');
});
const p2 = new Promise((_resolve, reject) => {
  reject(new Error('Failure'));
});

test('Promise.prototype.then --- res1', async () => {
  const res1 = await p1.then((value) => value);
  expect(res1).toBe('Success');
});
test('Promise.prototype.then --- res2', async () => {
  try {
    await p2.then((reason) => reason);
  } catch (error) {
    expect(error.message).toEqual('Failure');
  }
});
