var Component = require('..')
var test = require('tape')
var testComponent = require('../test-util')
var Timer = require('../examples/timer-component')
var h = require('../h')

test('timer component', function (t) {
  var timer = Component(Object.assign(Timer(1000), {trace: false}))
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

test('nested charts', function (t) {
  function example () {
    return {
      states: ['parent1', 'childChart'],
      initialStates: {parent1: true},
      transitions: {
        PUSH: ['parent1', 'childChart.s1'],
        POP: ['childChart.s2', 'parent1']
      },
      nestedCharts: {
        childChart: {
          states: ['s1', 's2'],
          transitions: {JUMP: ['s1', 's2']}
        }
      },
      view: function () {
        return h('div', 'hi')
      }
    }
  }
  const comp = Component(example())
  t.deepEqual(comp.states, {parent1: true})
  comp.emit('PUSH')
  t.deepEqual(comp.states, {childChart: {s1: true}})
  comp.emit('childChart.JUMP')
  t.deepEqual(comp.states, {childChart: {s2: true}})
  comp.emit('POP')
  t.deepEqual(comp.states, {parent1: true})
  t.end()
})

test('throws an error on an invalid event', function (t) {
  var comp = Component({
    states: ['s1'],
    initialStates: {s1: true},
    view: function () {
      return h('div', 'hi')
    }
  })
  t.throws(() => comp.emit('INVALID'))
  t.end()
})
