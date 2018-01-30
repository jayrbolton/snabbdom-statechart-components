var Component = require('..')
var Timer = require('./timer-component')
var timer = Timer(1000)
var container = document.createElement('div')
timer.container = container
Component(timer)
document.body.appendChild(container)
