var Component = require('..')
var test = require('tape')
var testComponent = require('../test-util')
var Timer = require('../examples/timer-component')

test('timer component', function (t) {
  var div = document.createElement('div')
  var timer = Component(Object.assign(Timer(1000), {container: div, trace: false}))
  testComponent(timer, [
    {
      event: 'SET_DUR',
      data: 999,
      test: function (timer) {
        t.strictEqual(timer.store.duration, 999)
        t.strictEqual(timer.store.ms, 999)
        t.deepEqual(timer.states, {reset: true})
      }
    },
    {
      event: 'START',
      test: function (timer) {
        t.deepEqual(timer.states, {running: true})
      }
    },
    {
      wait: 10,
      test: function (timer) {
        t.deepEqual(timer.states, {running: true})
        t.strictEqual(timer.store.ms, 989)
      }
    },
    {
      wait: 1100,
      test: function (timer) {
        t.deepEqual(timer.states, {finished: true})
        t.strictEqual(timer.store.ms, 0)
      }
    },
    {
      event: 'RESTART',
      test: function (timer) {
        t.deepEqual(timer.states, {reset: true})
        t.strictEqual(timer.store.ms, timer.store.duration)
        t.end()
      }
    },
    { event: 'START' },
    {
      wait: 10,
      event: 'STOP',
      function (timer) {
        t.deepEqual(timer.states, {paused: true})
      }
    }
  ])
})
