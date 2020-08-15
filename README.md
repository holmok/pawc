# pawc (Promise All with Concurrency)

This is basically a `Promise.all()` but with limiting the concurrency.  It works where you pass it the 
concurrency, and a promise map and will either resolve with a map of resolve and reject maps that will
match your promise map or optionally reject on the first rejected promise.  A promise map is an object
with keys that id the promise and the value is a function that returns a promise (!! Important the 
value is a function that returns a promise NOT a promise itself).

A neat side-effect of using this, is if you set the concurrency to `1` then it will sequentially run
your promises.

## Install

just run: `$ npm i pawc`

## Usage

### Simple Example

Super simple example, it's from a test in `tests.js`.

```
async function () {
  // map of two promises
  const promisesMap = {
    a: () => Promise.resolve('hello from a'),
    b: () => Promise.resolve('hello from b'),
  }
  const result = await pawc.all(1, promisesMap) // result is { resolves: { a:'hello from a', b:'hello from b' }}
}
```

Another simple example with a rejection, it's also from a test in `tests.js`.

```
async function () {
  // map of two promises
  const promisesMap = {
    a: () => Promise.resolve('hello from a'),
    b: () => Promise.reject(new Error('opps')),
  }
  const result = await pawc.all(1, promisesMap)  // result is { resolves: { a:'hello from a' }, rejects: { b: [oops Error] } }
}
```
### Reject on First

If you just want to reject the whole lot of promises on the first rejection then pass `true`
for the `rejectOnFirst` parameter (it is `false` by default).  Since this is a reject and
returns an error, you will lose any resolves that finished before the first rejection.  
Here is another example from the `tests.js`:

```
async function () {
  const promisesMap = {
    a: () => Promise.reject(new Error('oops')),
    b: () => Promise.resolve('will not be called') }
  }
  try {
    await pawc.all(1, promisesMap, true)
    // never reaches here
  } catch (error) {
    console.error(error.message) // oops
  }
}
```

### Async Await Example

Check out `example.js` for a little more complex example  using `async` functions and `await`.
You can run it with `DEBUG=* node example.js` to see extra debug logging.  Here is the example
output when it is ran:

```
pawc pawc.all called with concurrency of 2 and 5 promises ("task #1", "task #2", "task #3", "task #4", "task #5") +0ms
pawc starting promise task #1 +1ms
pawc starting promise task #2 +1ms
pawc promise task #2 finished +2s
pawc starting promise task #3 +0ms
pawc promise task #1 finished +2s
pawc starting promise task #4 +0ms
pawc promise task #4 finished +1s
pawc starting promise task #5 +0ms
pawc promise task #5 finished +1s
pawc promise task #3 finished +1s
pawc all promises done +0ms
{
  resolves: {
    'task #2': { id: 'task #2', ms: 1781.560542552069 },
    'task #1': { id: 'task #1', ms: 3641.017426104276 },
    'task #4': { id: 'task #4', ms: 1174.2142358962817 },
    'task #5': { id: 'task #5', ms: 1170.231974065761 },
    'task #3': { id: 'task #3', ms: 5306.500226395915 }
  },
  rejects: {}
}
```