var h = require('snabbdom/h').default

module.exports = function (duration) {
  return {
    trace: true,
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
      var toggleRunning = {'true': 'STOP', 'false': 'START'}
      return h('div', [
        h('button.toggle', {
          props: {
            disabled: timer.states.finished
          },
          on: {
            click: function () {
              timer.emit(toggleRunning[Boolean(timer.states.running)])
            }
          }
        }, timer.states.running ? 'Pause' : 'Start'),
        h('button.reset', {
          props: {
            disabled: timer.states.reset
          },
          on: {
            click: function () {
              timer.emit('RESTART')
            }
          }
        }, 'Reset'),
        h('input', {
          props: {
            placeholder: 'Duration in ms',
            value: timer.store.duration,
            disabled: !timer.states.reset
          },
          on: {
            input: function (ev) {
              var val = ev.currentTarget.value
              timer.emit('SET_DUR', val)
            }
          }
        }),
        h('p', ['Currently ', JSON.stringify(timer.states)]),
        h('p', ['time elapsed: ', timer.store.ms, ' / ', timer.store.duration])
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
