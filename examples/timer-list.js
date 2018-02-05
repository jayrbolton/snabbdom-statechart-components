var Component = require('..')
var TimerList = require('./timer-list-component')
var timerList = Component(TimerList([1000, 2000, 3000]))
document.body.appendChild(timerList.vnode.elm)
