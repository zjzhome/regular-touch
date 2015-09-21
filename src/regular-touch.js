/**
 * 扩展Regular的DOM事件
 * 方便移动Web的开发
 *
 * tap longTap doubleTap
 * swipe swipeLeft swipeRight swipeUp swipeDown
 */

;(function() {

var dom = Regular.dom

var swipes = ['', 'Left', 'Right', 'Up', 'Down']

var touch = {},
	longTapDelay = 750,
	firstTouch,
	now, delta,
	deltaX, deltaY

function swipeDirection(x1, x2, y1, y2) {
	return Math.abs(x1 - x2) >=
		Math.abs(y1 - y2) ? (x1 - x2 > 0 ? 'Left' : 'Right') : (y1 - y2 > 0 ? 'Up' : 'Down')
}

function onTouchstart(e) {
	e.preventDefault()
	firstTouch = e.event.targetTouches[0]
	if(e.event.targetTouches && e.event.targetTouches.length === 1 && touch.x2) {
		touch.x2 = undefined
		touch.y2 = undefined
	}

	now = Date.now()
	delta = now - (touch.last || now)

	touch.x1 = firstTouch.pageX
	touch.y1 = firstTouch.pageY

	if(delta > 0 && delta < 250) touch.isDoubleTap = true
	touch.last = now
}
function onTouchmove(e) {
	e.preventDefault()
	firstTouch = e.event.targetTouches[0]
	touch.x2 = firstTouch.pageX
	touch.y2 = firstTouch.pageY

	deltaX += Math.abs(touch.x1 - touch.x2)
	deltaY += Math.abs(touch.y1 - touch.y2)
}
function listenTouch(elem, onTouchend) {
	dom.on(elem, 'touchstart', onTouchstart)
	dom.on(elem, 'touchmove', onTouchmove)
	dom.on(elem, 'touchend', onTouchend)
}
function destroyTouch(elem, onTouchend) {
	return function destroy() {
		dom.off(elem, 'touchstart', onTouchstart)
		dom.off(elem, 'touchmove', onTouchmove)
		dom.off(elem, 'touchend', onTouchend)
	}	
}


Regular.event('tap', function(elem, fire) {

	function onTouchend(e) {
		e.preventDefault()
		firstTouch = e.event.changedTouches[0]
		if(Math.abs(firstTouch.pageX - touch.x1) < 6 &&
			Math.abs(firstTouch.pageY - touch.y1) < 6) {
			fire(e)
		}
	}

	listenTouch(elem, onTouchend)
	return destroyTouch(elem, onTouchend)
});

Regular.event('longTap', function(elem, fire) {

	function onTouchend(e) { // if move, should cancel
		e.preventDefault()
		if(touch.last) {
			if(Date.now() - touch.last > longTapDelay) {
				fire(e)
			}
		}
	}

	listenTouch(elem, onTouchend)
	return destroyTouch(elem, onTouchend)
});

Regular.event('doubleTap', function(elem, fire) {

	function onTouchend(e) {
		e.preventDefault()
		firstTouch = e.event.changedTouches[0]
		if('last' in touch) {
			if(Math.abs(firstTouch.pageX - touch.x1) < 6 &&
				Math.abs(firstTouch.pageY - touch.y1) < 6) {

				if(touch.isDoubleTap) {
					fire(e)
					touch = {}
				}
			}
		}
	}

	listenTouch(elem, onTouchend)
	return destroyTouch(elem, onTouchend)
});

swipes.forEach(function(evName) {
	Regular.event('swipe' + evName, function(elem, fire) {

		function onTouchend(e) {
			e.preventDefault();
			if(touch.x2 && Math.abs(touch.x1 - touch.x2) > 30 ||
				touch.y2 && Math.abs(touch.y1 - touch.y2) > 30) {

				if(evName) {
					if(swipeDirection(touch.x1, touch.x2, touch.y1, touch.y2) === evName) fire(e)
				} else {
					fire(e)
				}
			} 
		}

		listenTouch(elem, onTouchend)
		return destroyTouch(elem, onTouchend)
	})
})

Regular.event('drag', function(elem, fire) {

})

})();
