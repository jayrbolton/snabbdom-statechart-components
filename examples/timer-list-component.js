var h = require('snabbdom/h').default
var component = require('..')
var Timer = require('./timer-component')

module.exports = function (timerDurations) {
  return {
    trace: true,
    states: ['listing'],
    events: {
      ADD: ['listing', 'listing'],
      REM: ['listing', 'listing'],
      RESET_ALL: ['listing', 'listing']
    },
    initialStates: {listing: true},
    initialStore: function () {
      var store = {timerArr: [], timerObj: {}}
      timerDurations.forEach(function (dur) {
        push(store, dur) // mutates store
      })
      store.totalDuration = getTotalDuration(store.timerArr)
      return store
    },
    actions: {
      ADD: function (list, duration) {
        push(list.store, duration)
        list.store.totalDuration += duration
        return list.store
      },
      REM: function (list, id) {
        list.store.timerArr = list.store.timerArr.filter(function (timer) {
          return timer.id !== id
        })
        var timer = list.store.timerObj[id]
        list.store.timerObj[id] = undefined
        list.store.totalDuration = list.store.totalDuration - timer.store.duration
        return list.store
      },
      RESET_ALL: function (list) {
        list.store.timerArr.forEach(function (timer) {
          if (!timer.states.reset) {
            timer.emit('RESTART')
          }
        })
        return list.store
      }
    },
    view: function (list) {
      return h('div', [
        h('p', [list.store.timerArr.length, ' timers']),
        h('p', ['Total duration: ', list.store.totalDuration]),
        h('button', {
          on: {
            click: function () {
              list.emit('ADD', 1000)
            }
          }
        }, 'Add timer'),
        h('button', {
          on: {
            click: function () {
              list.emit('RESET_ALL')
            }
          }
        }, 'Reset all'),
        h('div', 
          list.store.timerArr.map(function (timer, idx) {
            return h('div', {key: timer.id}, [
              'Timer ',
              idx,
              h('br'),
              h('button', {
                on: {
                  click: function () { list.emit('REM', timer.id) }
                }
              }, 'Remove this timer'),
              timer.vnode
            ])
          })
        )
      ])
    }
  }
}

function getTotalDuration (timers) {
  return timers.reduce(function (sum, timer) {
    return sum + timer.store.duration
  }, 0)
}

function push (store, duration) {
  var timer = component(Timer(duration))
  store.timerArr.push(timer)
  store.timerObj[timer.id] = timer
}
