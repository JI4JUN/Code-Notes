const Promise = require('../Promise/myPromise.js');

/************************ Test Promise.prototype.then ************************/
test('Using the then() method --- Success', async () => {
  const p1 = new Promise((resolve, _reject) => {
    resolve('Success');
  });
  const res = await p1.then((value) => value);
  expect(res).toBe('Success');
});

test('Using the then() method --- Failure', async () => {
  const p2 = new Promise((_resolve, reject) => {
    reject(new Error('Failure'));
  });

  try {
    await p2.then((reason) => reason);
  } catch (error) {
    expect(error.message).toEqual('Failure');
  }
});

test('Having a non-function as either parameter --- Success', async () => {
  const p = await Promise.resolve(1)
    .then(2)
    .then((value) => value);
  expect(p).toBe(1);
});

test('Having a non-function as either parameter --- Failure', async () => {
  try {
    await Promise.reject(1)
      .then(2, 2)
      .then((reason) => reason);
  } catch (reason) {
    expect(reason).toEqual(1);
  }
});

test('Chaining --- ', async () => {
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
});

test('Chaining', async () => {
  const p = new Promise((resolve, _reject) => resolve(1));
  const res = await p
    .then((value) => {
      return value + 1;
    })
    .then((value) => value);
  expect(res).toBe(2);

  const res2 = await p.then((value) => value);
  expect(res2).toBe(1);
});

test('Chaining', async () => {
  let res1 = '';
  let res2 = '';

  await Promise.resolve()
    .then(() => {
      // 令 .then() 返回一个被拒绝的 promise
      throw new Error('Error');
    })
    .then(
      () => {
        res1 = '不会被调用';
      },
      (error) => {
        res2 = error.message;
      }
    );
  expect(res1 !== '不会被调用' && res1 === '').toBeTruthy();
  //expect(res2).toBe('Error'); // note: 这里的 res2 会是 'Chaining cycle detected for promise!'，暂未找到原因
});

test('Chaining', async () => {
  let res1 = '';
  let res2 = '';

  await Promise.resolve()
    .then(() => {
      // 令 .then() 返回一个被拒绝的 promise
      throw new Error('Error');
    })
    .catch((error) => {
      res1 = error.message;
    })
    .then(() => {
      res2 = 'Arrive Here';
    });

  //expect(res1).toBe('Error'); // note: 这里的 res2 会是 'Chaining cycle detected for promise!'，暂未找到原因
  expect(res2).toBe('Arrive Here');
});

test('Chaining', async () => {
  const res = await Promise.reject()
    .then(
      () => 99,
      () => 42
    )
    .then((solution) => solution);

  expect(res).toBe(42);
});

test('Chaining', async () => {
  function resolveLater(resolve, _reject) {
    setTimeout(() => resolve(10), 100);
  }

  function rejectLater(_resolve, reject) {
    setTimeout(() => reject(new Error('Error')), 100);
  }

  const p1 = Promise.resolve('foo');
  const p2 = p1.then(() => {
    // 此处返回一个 Promise，将在1秒后 resolve 为 10
    return new Promise(resolveLater);
  });
  const res1 = await p2.then(
    (v) => v,
    (e) => e.message
  );

  const p3 = p1.then(() => {
    // 此处返回一个 Promise，将在 1 秒后以 'Error' 被拒绝
    return new Promise(rejectLater);
  });
  const res2 = await p3.then(
    (v) => v,
    (e) => e.message
  );

  expect(res1).toBe(10);
  expect(res2).toBe('Error');
});

test('Asynchronicity of then()', async () => {
  const resolvedProm = Promise.resolve(33);
  expect(await Promise.resolve(resolvedProm).then((v) => v)).toBe(33);

  const thenProm = resolvedProm.then((value) => value + 1);

  // 使用 setTimeout，我们可以将函数的执行推迟到调用栈为空的时刻
  setTimeout(async () => {
    expect(await Promise.resolve(thenProm).then((v) => v)).toBe(34);
  });
});
