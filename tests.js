const tap = require('tap')
const pawc = require('./pawc')

tap.test('all resolve', async (t) => {
  t.plan(2)
  const promisesMap = {
    a: () => Promise.resolve(1),
    b: () => Promise.resolve(2)
  }
  const result = await pawc.all(1, promisesMap)
  t.deepEquals(result.resolves, { a: 1, b: 2 })
  t.deepEquals(result.rejects, {})
})

tap.test('some fail', async (t) => {
  t.plan(2)
  const promisesMap = {
    a: () => Promise.resolve(1),
    b: () => Promise.reject(new Error('oops'))
  }
  const result = await pawc.all(1, promisesMap, false)
  t.deepEquals(result.resolves, { a: 1 })
  t.equal(result.rejects.b.message, 'oops')
})

tap.test('some reject on first', async (t) => {
  t.plan(1)
  const promisesMap = {
    a: () => Promise.reject(new Error('oops')),
    b: () => { t.fail('should never be called.') }
  }
  try {
    await pawc.all(1, promisesMap, true)
    t.fail('should have thorwn.')
  } catch (error) {
    t.equals(error.message, 'oops')
  }
})
