function setUp() {
}

function testAttachAndDetach() {
	var observer = {
		recordingEnabled: true
	};
	var count = 0;
	Recorder.addEventHandler('clickTest', 'click', function(event) {
			count++;
		});
	var recorder = Recorder.register(observer, window);
	var element = document.getElementById('theLink');
	assertNotNull(element);
	assertEquals(0, count);

	// the handler should be called
	triggerMouseEvent(element, 'click', true);
	assertEquals(1, count);

	recorder.detach();

	// the handler should not be called
	triggerMouseEvent(element, 'click', true);
	assertEquals(1, count);
}

function testRegisterAndRecordAndDeregister() {
    var property = "_Selenium_IDE_Recorder_test";
    Recorder.WINDOW_RECORDER_PROPERTY = property;
	var observer = {
		recordingEnabled: true,
		count: 0, 
		addCommand: function(command, target, value, window) {
			assertEquals("test", command);
			this.count++;
		}
	};
	assertUndefined(window[property]);
	var recorder = Recorder.register(observer, window);
	recorder.record("test", "aaa", "bbb");
	assertEquals(1, observer.count);
	assertNotNull(window[property]);
	recorder.deregister(observer);
	assertUndefined(window[property]);
}


// triggerMouseEvent dissappeared in Selenium Core 0.8.2, so this function is copied from 0.8.1
function triggerMouseEvent(element, eventType, canBubble, clientX, clientY, controlKeyDown, altKeyDown, shiftKeyDown, metaKeyDown) {
    clientX = clientX ? clientX : 0;
    clientY = clientY ? clientY : 0;

    LOG.warn("triggerMouseEvent assumes setting screenX and screenY to 0 is ok");
    var screenX = 0;
    var screenY = 0;

    canBubble = (typeof(canBubble) == undefined) ? true : canBubble;
    if (element.fireEvent) {
        LOG.info("element has fireEvent");
        var evt = createEventObject(element, controlKeyDown, altKeyDown, shiftKeyDown, metaKeyDown);
        evt.detail = 0;
        evt.button = 1;
        evt.relatedTarget = null;
        if (!screenX && !screenY && !clientX && !clientY) {
            element.fireEvent('on' + eventType);
        }
        else {
            evt.screenX = screenX;
            evt.screenY = screenY;
            evt.clientX = clientX;
            evt.clientY = clientY;

            // when we go this route, window.event is never set to contain the event we have just created.
            // ideally we could just slide it in as follows in the try-block below, but this normally
            // doesn't work.  This is why I try to avoid this code path, which is only required if we need to
            // set attributes on the event (e.g., clientX).
            try {
                window.event = evt;
            }
            catch(e) {
                // getting an "Object does not support this action or property" error.  Save the event away
                // for future reference.
                // TODO: is there a way to update window.event?

                // work around for http://jira.openqa.org/browse/SEL-280 -- make the event available somewhere:
                selenium.browserbot.getCurrentWindow().selenium_event = evt;
            }
            element.fireEvent('on' + eventType, evt);
        }
    }
    else {
        LOG.info("element doesn't have fireEvent");
        var evt = document.createEvent('MouseEvents');
        if (evt.initMouseEvent)
        {
            LOG.info("element has initMouseEvent");
            //Safari
            evt.initMouseEvent(eventType, canBubble, true, document.defaultView, 1, screenX, screenY, clientX, clientY, controlKeyDown, altKeyDown, shiftKeyDown, metaKeyDown, 0, null)
        }
        else {
        	LOG.warn("element doesn't have initMouseEvent; firing an event which should -- but doesn't -- have other mouse-event related attributes here, as well as controlKeyDown, altKeyDown, shiftKeyDown, metaKeyDown");
            evt.initEvent(eventType, canBubble, true);
            
            evt.shiftKey = shiftKeyDown;
            evt.metaKey = metaKeyDown;
            evt.altKey = altKeyDown;
            evt.ctrlKey = controlKeyDown;

        }
        element.dispatchEvent(evt);
    }
}

