var h = require('../h')

module.exports = function (duration) {
  return {
    trace: true,
    states: ['running', 'paused', 'reset', 'finished'],
    transitions: {
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
      SET_DUR: ['reset', 'reset'],
      DONE: ['running', 'finished'],
      TICK: ['running', 'running']
    },
    initialStates: {reset: true},
    actions: {
      SET_DUR: function (timer, val) {
        timer.store.ms = val
        timer.store.duration = val
        return timer.store
      },
      START: function (timer) {
        tick(timer)
        return timer.store
      },
      RESTART: function (timer) {
        timer.store.ms = timer.store.duration
        return timer.store
      },
      TICK: function (timer) {
        timer.store.ms = timer.store.ms - 10
        return timer.store
      },
      DONE: function (timer) {
        timer.store.ms = 0
        return timer.store
      }
    },
    initialStore: function () {
      return {
        ms: duration,
        duration: duration
      }
    },
    view: function (timer) {
      // If running, then stop; if not running, then start
      function toggleRunning () {
        timer.emit(timer.states.running ? 'STOP' : 'START')
      }
      return h('div', [
        h('button.toggle', {
          props: {disabled: timer.states.finished},
          on: {click: toggleRunning}
        }, timer.states.running ? 'Pause' : 'Start'),
        h('button.reset', {
          on: {click: () => timer.emit('RESTART')},
          props: {disabled: timer.states.reset}
        }, 'Reset'),
        h('input', {
          props: {placeholder: 'Duration in ms', value: timer.store.duration, disabled: !timer.states.reset},
          on: {input: ev => timer.emit('SET_DUR', ev.currentTarget.value)}
        }),
        h('p', ['Currently ', JSON.stringify(timer.states)]),
        h('p', ['Time elapsed ', timer.store.ms, ' / ', timer.store.duration])
      ])
    }
  }
}

function tick (timer) {
  if (!timer.states.running) return
  if (timer.store.ms <= 0) {
    timer.emit('DONE')
    return
  }
  setTimeout(function () {
    if (!timer.states.running) return
    timer.emit('TICK')
    tick(timer)
  }, 10)
}
