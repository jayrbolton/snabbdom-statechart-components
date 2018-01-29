var h = require('snabbdom/h').default
var component = require('..')
var test = require('tape')

test('hello world', function (t) {
  var container = document.createElement('div')
  component({
    states: ['running', 'paused', 'reset', 'finished'],
    events: {
      START: [
        ['paused', 'running'],
        ['reset', 'running']
      ],
      STOP: ['running', 'paused'],
      RESTART: [
        ['finished', 'reset'],
        ['running', 'reset'],
        ['paused', 'reset']
      ],
      DONE: ['running', 'finished']
    },
    initial: {reset: true},
    actions: {
      START: function (store, update) {
        tick(store, update)
      }
    },
    store: function (update) {
      update({
        ms: 0
      })
    },
    view: function (store, event) {
      // If running, then stop; if not running, then start
      var toggleRunning = {'true': 'STOP', 'false': 'START'}
      return h('div', [
        h('button.toggle', {
          on: {
            click: function () {
              event(toggleRunning[Boolean(store.states.running)])
            }
          }
        }, store.states.running ? 'Pause' : 'Start'),
        h('p', ['Currently ', JSON.stringify(store.states)]),
        'time elapsed: ', store.ms
      ])
    },
    container: container
  })

  console.log('div', container.textContent)
  container.querySelector('button.toggle').click()
  setTimeout(function () {
    console.log('div', container.textContent)
    container.querySelector('button.toggle').click()
  }, 50)
  setTimeout(function () {
    console.log('div', container.textContent)
    container.querySelector('button.toggle').click()
  }, 1000)
  setTimeout(function () {
    console.log('div', container.textContent)
    t.end()
  }, 2000)
})

function tick (store, update) {
  if (!store.states.running) return
  setTimeout(function () {
    update({ms: store.ms + 10})
    tick(store, update)
  }, 10)
}
