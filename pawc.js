const debug = require('debug')('pawc')

function start ({ key, func }) {
  debug('starting promise %s', key)
  this._running[key] = { key, func }
  func()
    .then((result) => {
      debug('promise %s finished', key)
      this._result.resolves[key] = result
    })
    .catch((error) => {
      debug('promise %s failed, %o', key, error)
      if (this._rejectOnFirst) {
        this._queue = undefined
        this._reject(error)
      } else {
        this._result.rejects[key] = error
      }
    })
    .finally(() => {
      delete this._running[key]
      if (this._queue && Object.keys(this._queue).length > 0) {
        const key = Object.keys(this._queue).shift()
        const next = this._queue[key]
        delete this._queue[key]
        start.call(this, next)
      }
      if (this._queue && Object.keys(this._running).length === 0 && (Object.keys(this._queue).length === 0)) {
        debug('all promises done')
        this._resolve(this._result)
      }
    })
}

function all (concurrency, promiseMap, rejectOnFirst = false) {
  debug('pawc.all called with concurrency of %d and %d promises ("%s")', concurrency, Object.keys(promiseMap).length, Object.keys(promiseMap).join('", "'))
  return new Promise((resolve, reject) => {
    this._resolve = resolve
    this._reject = reject
    this._rejectOnFirst = rejectOnFirst
    this._concurrency = concurrency
    this._running = {}
    this._queue = {}
    this._result = { resolves: {}, rejects: {} }

    // these will be queued
    Object.keys(promiseMap).slice(concurrency).forEach(key => {
      const func = promiseMap[key]
      this._queue[key] = { key, func }
    })

    // these will start right away
    Object.keys(promiseMap).slice(0, concurrency).forEach(key => {
      const func = promiseMap[key]
      start.call(this, { key, func })
    })
  })
}

module.exports = { all }
