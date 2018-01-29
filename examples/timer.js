var h = require('snabbdom/h').default
var component = require('..')
var Timer = require('./timer-component')
var timer = Timer(1000)
var container = document.createElement('div')
timer.container = container
component(timer)
document.body.appendChild(container)
