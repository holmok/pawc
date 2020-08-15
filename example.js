// run with DEBUG=* to see debug messages.

const pawc = require('./pawc')

// a function that is a promise
function wait (id, ms) {
  return new Promise((resolve) => {
    setTimeout(() => { resolve({ id, ms }) }, ms)
  })
}

// create a promise map
const x = [1, 2, 3, 4, 5]
const promiseMap = {}

x.forEach(x => {
  const key = `task #${x}`
  promiseMap[key] = () => wait(key, Math.random() * 5000 + 1000)
})

// run it with only executing 2 at a time
pawc.all(2, promiseMap)
  .then((r) => { console.log(r) })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
