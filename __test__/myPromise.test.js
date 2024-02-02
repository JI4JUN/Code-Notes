const Promise = require('../Promise/myPromise.js');

/************************ Test Promise.prototype.then ************************/
test('Using the then() method', async () => {
  const p1 = new Promise((resolve, _reject) => {
    resolve('Success');
  });
  const res = await p1.then((value) => value);
  expect(res).toBe('Success');

  const p2 = new Promise((_resolve, reject) => {
    reject(new Error('Failure'));
  });

  try {
    await p2.then((reason) => reason);
  } catch (error) {
    expect(error.message).toEqual('Failure');
  }
});

test('Having a non-function as either parameter', async () => {
  const p = await Promise.resolve(1)
    .then(2)
    .then((value) => value);
  expect(p).toBe(1);

  try {
    await Promise.reject(1)
      .then(2, 2)
      .then((reason) => reason);
  } catch (reason) {
    expect(reason).toEqual(1);
  }
});

test('Chaining', async () => {
  const res1 = await Promise.resolve('foo')
    .then(
      (string) =>
        new Promise((resolve, _reject) => {
          setTimeout(() => {
            string += 'bar';
            resolve(string);
          }, 1);
        })
    )
    .then((string) => {
      setTimeout(() => {
        string += 'baz';
        expect(string).toBe('foobarbaz');
      }, 1);
      return string;
    })
    .then((string) => string);
  expect(res1).toBe('foobar');

  const p = new Promise((resolve, _reject) => resolve(1));
  const res2 = await p
    .then((value) => {
      return value + 1;
    })
    .then((value) => value);
  expect(res2).toBe(2);

  const res3 = await p.then((value) => value);
  expect(res3).toBe(1);
});
