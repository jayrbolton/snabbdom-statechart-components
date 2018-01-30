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
    view: function (list, html) {
      var timers = list.store.timerArr.map(function (timer, idx) {
        return html`
          <div @key=${timer.id}>
            Timer ${idx}
            <br>
            <button @on:click=${() => list.emit('REM', timer.id)}> Remove this timer </button>
            ${timer.vnode}
          </div>
        `
      })
      console.log('timers', timers)
      return html`
        <div>
          <p> ${list.store.timerArr.length} timers </p>
          <p> Total duration: ${list.store.totalDuration} </p>
          <button @on:click=${() => list.emit('ADD', 1000)}> Add timer </button>
          <button @on:click=${() => list.emit('RESET_ALL')}> Reset all </button>
          <div>${timers}</div>
        </div>
      `
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
