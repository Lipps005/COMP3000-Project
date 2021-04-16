/* 
 * Author: Samuel Lippett
 * Project: COMP3000 Coursework
 */
function CustomWorker() {
    worker = new Worker("getFrameThread.js");
    listeners = new Map();

    this.postMessage = function(data, transfer=null) {
        if (transfer === null) {
            worker.postMessage(data);
        } else {
            worker.postMessage(data, transfer);
        }
    }

    this.addEventListener = function(name, listener) {
        listeners.set(name, listener);
    }

    this.removeEventListener = function(name) {
        listeners.delete(name);
    }

    worker.onmessage = async function(event) {
        listeners.get(event.data.customEvent)(event);
    }

    this.sendQuery = function() {

        worker.postMessage({
            'customEvent': arguments[0],
            'eventArguments': Array.prototype.slice.apply(arguments, 1)
        });
    }
}

const event = new CustomEvent('capture',{
    detail: "capture event"
});

var t0;
var t1;
var track;
var mediaStream;
var imageCapture;

function dispatchCaptureEvent() {
    document.dispatchEvent(event);

}
var interval = setInterval(dispatchCaptureEvent, (1 / 17) * 1000);

//create serviceWorker
if ("serviceWorker"in navigator) {
    var sworker = navigator.serviceWorker.register('service-worker.js');
}

//set up custom webworker and pass it an offscreen canvas.
var WebWorker = new CustomWorker();

//check if touch is supported in browser
var tooolbarstartevent, toolbarmoveevent, toolbarendevent;
if ("ontouchstart"in window) {
    toolbarstartevent = "touchstart";
    toolbarmoveevent = "touchmove";
    toolbarendevent = "touchend";
} else {
    tooolbarstartevent = "mousedown";
    toolbarmoveevent = "mousemove";
    toolbarendevent = "mouseup";
}

function getCamera() {
    return navigator.mediaDevices.getUserMedia({
        video: {
            facingMode: {
                exact: "user"
            }
        }
    }).then(gotMedia).catch(err=>console.error('getUserMedia() failed: ', err));
}

function gotMedia(mediastream) {
    mediaStream = mediastream;
    track = mediastream.getVideoTracks()[0];
    imageCapture = new ImageCapture(track);

    //setting the srcObject of the video element
    //means track isnt immediately muted when the 
    //stream is paused.
    const video = document.getElementById('hiddenvideo');
    video.srcObject = mediaStream;
    //video.play();

    let documentVideoElement = document.getElementById("offscreencanvas");

    documentVideoElement.width = track.getSettings().width;
    documentVideoElement.height = track.getSettings().height;

    WebWorker.postMessage({
        customEvent: "transferCanvas",
        width: track.getSettings().width,
        height: track.getSettings().height
    });

    track.onmute = function(evt) {
        evt.preventDefault();
        console.log("muted");
        $(document).unbind("capture");
        $("#loading-cover").toggleClass("load-out");

    }
    ;

    track.onunmute = function(evt) {
        console.log("unmuted");
        $(document).on("capture", captureFrame);
        $("#loading-cover").toggleClass("load-out");

    }
    ;

    track.ended = function(evt) {
        console.log("ended");
    }
    ;
}

function captureFrame(e) {
    if (track.readyState === "live" && track.muted === false && track.enabled === true) {
        imageCapture.grabFrame().then(processFrame).catch((err)=>{
            console.error('grabFrame() failed: ', track.enabled);
        }
        );

    }
}

function processFrame(imgData) {
    WebWorker.postMessage({
        customEvent: "transferImageBitmap",
        bitmap: imgData
    }, [imgData]);
}

$(document).ready(function() {

    WebWorker.addEventListener("returnCoordinates", async function(result) {
    var drawingCanvas = document.getElementById('drawing-container');

    let pointx = result.data.scaledx * document.getElementById('drawing-container').offsetWidth;
    let pointy = result.data.scaledy * document.getElementById('drawing-container').offsetHeight;
    
    drawingCanvas.getContext("2d").lineTo(pointx, pointy);
    drawingCanvas.getContext("2d").stroke();   

    });

    WebWorker.addEventListener("returnNewContext", async function(result) {
        var context = document.getElementById("offscreencanvas").getContext("2d");
        context.putImageData(result.data.bitmap, 0, 0);
    });

    function notifyOnline() {
        $("#online-modal").removeClass("modal-notify");
        void $("#online-modal").outerWidth();
        $("#online-modal").addClass("modal-notify");

    }

    function notifyOffline() {
        $("#offline-modal").removeClass("modal-notify");
        void $("#offline-modal").outerWidth();
        $("#offline-modal").addClass("modal-notify");
    }

    window.addEventListener('online', notifyOnline);
    window.addEventListener('offline', notifyOffline);

    var pos1 = 0
      , pos2 = 0
      , pos3 = 0
      , pos4 = 0;

    $("#toolbar-mover").on(toolbarstartevent, function(e) {

        var event = e.changedTouches[0];

        // get the mouse cursor position at startup:
        pos3 = event.clientX;
        pos4 = event.clientY;
        // call a function whenever the cursor moves:
        $("body").on(toolbarmoveevent, mousemover);

        $("body").on(toolbarendevent, mouseupevent);

    });
    
    function mousemover(e) {
        var event = e.changedTouches[0] === undefined ? e : e.changedTouches[0];
        pos1 = pos3 - event.clientX;
        pos2 = pos4 - event.clientY;
        pos3 = event.clientX;
        pos4 = event.clientY;
        $("#toolbar").css("margin-bottom", ($("#toolbar-container").innerHeight() - pos4) + "px");
        $("#toolbar").css("margin-right", ($("#toolbar-container").innerWidth() - pos3) + "px");
    }
    ;function mouseupevent() {
        /* stop moving when mouse button is released:*/
        $("body").unbind("mousemove touchmove");
        $("body").unbind("mouseup touchend");
    }

    function userClickPause() {
        console.log("pause");
        try {
            track.enabled = false;
            $("#pause-button, #play-button").toggleClass("element-hidden");
            $("#loading-cover").removeClass("load-out");
            $("#loader-text-hint").text("App paused. Press play to continue");
        } catch (err) {
            console.log("track not defined");
        }
    }
    ;function userClickPlay() {
        console.log("play");
        try {
            track.enabled = true;
            $("#pause-button, #play-button").toggleClass("element-hidden");
            $("#loading-cover").addClass("load-out");

        } catch (err) {
            console.log("track not defined");
        }
    }
    ;$(window).on("blur", userClickPause);
    $("#pause-button").click(userClickPause);
    $("#play-button").click(userClickPlay);

    $("#camera-show").click(async function() {
        getCamera()
        .then(()=>{
        $("#loading-cover").toggleClass("load-out");
        $(document).on("capture", captureFrame);
        userClickPlay();
        $("#camera-hide, #camera-show").addClass("element-hidden");
        }
        )
        .catch()
        {
            $("#loader-text-hint").text("unable to get camera permission");
        }

    });

    var showToolbar = function() {

        $("#toolbar-body").toggleClass("roll");
        $(this).toggleClass("roll");

    };

    $("#toolbar-mover").click(showToolbar);

    $(window).resize(function() {
        $("#toolbar").css("top", $("body").height() - $("toolbar").outerWidth(true) + "px");
    });
});
