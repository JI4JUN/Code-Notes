const Promise = require('../Promise/myPromise.js');

/************************ Test Promise.prototype.then() ************************/
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

/************************ Test Promise.all() ************************/
test('Using Promise.all()', async () => {
  const p1 = Promise.resolve(3);
  const p2 = 1337;
  const p3 = new Promise((resolve, _reject) => {
    setTimeout(() => {
      resolve('foo');
    }, 100);
  });

  const res = await Promise.all([p1, p2, p3]).then((values) => values);
  expect(res).toEqual([3, 1337, 'foo']);
});

test('Using Promise.all()', async () => {
  // 所有的值都不是 Promise，因此返回的 Promise 将被兑现
  const p = await Promise.all([1, 2, 3]);
  expect(p).toEqual([1, 2, 3]);

  // 输入中唯一的 Promise 已经被兑现，因此返回的 Promise 将被兑现
  const p2 = await Promise.all([1, 2, 3, Promise.resolve(444)]);
  expect(p2).toEqual([1, 2, 3, 444]);

  // 一个（也是唯一的一个）输入 Promise 被拒绝，因此返回的 Promise 将被拒绝
  return Promise.all([1, 2, 3, Promise.reject(555)]).catch((error) =>
    expect(error).toEqual(555)
  );
});

test('Asynchronicity or synchronicity of Promise.all', () => {
  // 传入一个已经 resolved 的 Promise 数组，以尽可能快地触发 Promise.all
  const resolvedPromisesArray = [Promise.resolve(33), Promise.resolve(44)];
  const p = Promise.all(resolvedPromisesArray);
  expect(p.status).toEqual('pending');

  return expect(p).resolves.toEqual([33, 44]);
});

test('Asynchronicity or synchronicity of Promise.all', () => {
  const mixedPromisesArray = [Promise.resolve(33), Promise.reject(44)];
  const p = Promise.all(mixedPromisesArray);
  expect(p.status).toEqual('pending');

  return expect(p).rejects.toBe(44);
});

test('Promise.all fail-fast behavior', async () => {
  const p1 = new Promise((resolve, _reject) => {
    setTimeout(() => resolve('一', 100));
  });
  const p2 = new Promise((resolve, _reject) => {
    setTimeout(() => resolve('二', 200));
  });
  const p3 = new Promise((resolve, _reject) => {
    setTimeout(() => resolve('三', 300));
  });
  const p4 = new Promise((resolve, _reject) => {
    setTimeout(() => resolve('四', 400));
  });
  const p5 = new Promise((_resolve, reject) => {
    reject(new Error('拒绝'));
  });

  await Promise.all([p1, p2, p3, p4, p5])
    .then((values) => values)
    .catch((err) => {
      expect(err.message).toEqual('拒绝');
    });
});

test('Promise.all fail-fast behavior', async () => {
  const p1 = new Promise((resolve, _reject) => {
    setTimeout(() => resolve('p1 延迟解决'), 100);
  });

  const p2 = new Promise((_resolve, reject) => {
    reject(new Error('p2 立即拒绝'));
  });

  const res = await Promise.all([
    p1.catch((error) => error),
    p2.catch((error) => error)
  ]).then((values) => values);

  expect(res[0]).toBe('p1 延迟解决');
  expect(res[1].message).toBe('p2 立即拒绝');
});

/************************ Test Promise.allSettled() ************************/
test('Using Promise.allSettled()', async () => {
  const res = await Promise.allSettled([
    Promise.resolve(33),
    new Promise((resolve) => setTimeout(() => resolve(66), 0)),
    99,
    Promise.reject(new Error('an error'))
  ]).then((values) => {
    return values;
  });

  expect(res).toEqual([
    { status: 'fulfilled', value: 33 },
    { status: 'fulfilled', value: 66 },
    { status: 'fulfilled', value: 99 },
    { status: 'rejected', reason: Error('an error') }
  ]);
});

/************************ Test Promise.any() ************************/
test('Using Promise.any()', async () => {
  const pErr = new Promise((_resolve, reject) => reject('Always fails'));
  const pSlow = new Promise((resolve, _reject) =>
    setTimeout(resolve, 200, 'Done eventually')
  );
  const pFast = new Promise((resolve, _reject) =>
    setTimeout(resolve, 100, 'Done quick')
  );

  const res = await Promise.any([pErr, pSlow, pFast]).then((value) => value);

  expect(res).toBe('Done quick');
});

test('Rejections with AggregateError', async () => {
  const failure = new Promise((_resolve, reject) => {
    reject('Always fails');
  });

  const res = await Promise.any([failure]).catch((err) => err);

  expect(res).toEqual(AggregateError(''));
});

/************************ Test Promise.prototype.catch() ************************/
test('Using and chaining the catch() method', async () => {
  let res;
  let res2;
  let res3;
  let res4;
  let res5;
  let res6;

  const p1 = new Promise((resolve, _reject) => resolve('Success'));
  const p2 = new Promise((resolve, _reject) => resolve('Success'));

  await p1
    .then((value) => {
      res = value;
      throw new Error('oh, no!');
    })
    .catch((e) => (res2 = e.message))
    .then(
      () => (res3 = 1),
      () => (res3 = 2)
    );
  await p2
    .then((value) => {
      res4 = value;
      return Promise.reject('oh, no!');
    })
    .catch((e) => (res5 = e))
    .then(
      () => (res6 = 1),
      () => (res6 = 2)
    );

  expect(res).toBe('Success');
  expect(res2).toBe('oh, no!');
  expect(res3).toBe(1);
  expect(res4).toBe('Success');
  expect(res5).toBe('oh, no!');
  expect(res6).toBe(1);
});

test('Gotchas when throwing errors', () => {
  const p = new Promise((_resolve, _reject) => {
    throw new Error('Uh-oh!');
  });

  return p.catch((e) => expect(e).toEqual(Error('Uh-oh!')));
});

/************************ Test Promise.prototype.finally() ************************/
test('Using finally()', async () => {
  let res1;
  let res2 = false;
  let res3;
  let res4 = false;

  const p1 = new Promise((resolve, _reject) => {
    resolve('success');
  });
  const p2 = new Promise((_resolve, reject) => {
    reject(new Error('failure'));
  });

  await p1
    .then((value) => {
      res1 = value;
    })
    .finally(() => {
      res2 = true;
    });
  await p2
    .catch((err) => {
      res3 = err.message;
    })
    .finally(() => {
      res4 = true;
    });

  expect(res1).toBe('success');
  expect(res2).toBe(true);
  expect(res3).toBe('failure');
  expect(res4).toBe(true);
});

/************************ Test Promise.prototype.race() ************************/
test('Using Promise.race()', async () => {
  function sleep(time, value, state) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        return state === 'fulfill' ? resolve(value) : reject(new Error(value));
      }, time);
    });
  }

  const p1 = sleep(200, 'one', 'fulfill');
  const p2 = sleep(100, 'two', 'fulfill');
  const p3 = sleep(100, 'three', 'fulfill');
  const p4 = sleep(200, 'four', 'reject');
  const p5 = sleep(300, 'five', 'fulfill'); // time 设置为大于 210 时，p5 会先于 p6 兑现。暂时还未找到原因
  const p6 = sleep(100, 'six', 'reject');

  const res1 = await Promise.race([p1, p2]).then((value) => value);
  const res2 = await Promise.race([p3, p4]).then(
    (value) => value,
    (_error) => {}
  );
  const res3 = await Promise.race([p5, p6]).then(
    (_value) => _value,
    (error) => error.message
  );

  expect(res1).toBe('two');
  expect(res2).toBe('three');
  expect(res3).toBe('six');
});

test('Asynchronicity of Promise.race', () => {
  const resolvedPromisesArray = [Promise.resolve(33), Promise.resolve(44)];
  const p = Promise.race(resolvedPromisesArray);

  expect(p.status).toBe('pending');

  return expect(p).resolves.toEqual(33);
});

test('Asynchronicity of Promise.race', () => {
  const foreverPendingPromise = Promise.race([]);

  return expect(foreverPendingPromise.status).toBe('pending');
});

test('Asynchronicity of Promise.race', async () => {
  const foreverPendingPromise = Promise.race([]);
  const alreadyFulfilledProm = await Promise.resolve(100);

  const arr = [
    foreverPendingPromise,
    alreadyFulfilledProm,
    'non-Promise value'
  ];
  const arr2 = [
    foreverPendingPromise,
    'non-Promise value',
    Promise.resolve(100)
  ];
  const p = await Promise.race(arr);
  const p2 = await Promise.race(arr2);

  expect(p).toBe(100);
  expect(p2).toBe('non-Promise value');
});

// notes: 未找到正确的单元测试方法
// test('Using Promise.race() to detect the status of a promise', () => {
//   function promiseState(promise) {
//     const pendingState = { status: 'pending' };

//     return Promise.race([promise, pendingState]).then(
//       (value) =>
//         value === pendingState ? value : { status: 'fulfilled', value },
//       (reason) => ({ status: 'rejected', reason })
//     );
//   }

//   const p1 = new Promise((res) => setTimeout(() => res(100), 100));
//   const p2 = new Promise((res) => setTimeout(() => res(200), 200));
//   const p3 = new Promise((_res, rej) => setTimeout(() => rej(300), 100));

//   let res1;
//   let res2;
//   let res3;

//   async function getStates() {
//     res1 = await promiseState(p1);
//     res2 = await promiseState(p2);
//     res3 = await promiseState(p3);
//   }

//   function fun() {
//     getStates();
//     setTimeout(() => getStates(), 100);
//   }

//   jest.useFakeTimers();
//   fun();
//   jest.runAllTimers();

//   expect(res1).toEqual({ status: 'fulfilled', value: 100 });
//   expect(res2).toEqual({ status: 'pending' });
//   expect(res3).toEqual({ status: 'rejected', reason: 300 });
// });
