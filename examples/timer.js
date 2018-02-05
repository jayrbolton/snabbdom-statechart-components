var Component = require('..')
var Timer = require('./timer-component')
var timer = Component(Timer(1000))
document.body.appendChild(timer.vnode.elm)
