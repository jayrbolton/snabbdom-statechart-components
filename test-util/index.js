module.exports = test

function test (component, events) {
  var idx = 0
  function runTest () {
    if (events.length === idx) return
    var each = events[idx]
    var eventName = each.event
    var data = each.data
    var testFn = each.test
    var waitMs = each.wait
    function test () {
      if (eventName) component.emit(eventName, data)
      if (testFn) testFn(component)
      idx += 1
      runTest()
    }
    waitMs ? setTimeout(test, waitMs) : test()
  }
  runTest()
}
