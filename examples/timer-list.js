var component = require('..')
var TimerList = require('./timer-list-component')
var timerList = TimerList([1000, 2000, 3000])
var container = document.createElement('div')
timerList.container = container
component(timerList)
document.body.appendChild(container)
