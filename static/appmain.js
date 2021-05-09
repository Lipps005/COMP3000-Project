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

    var svgDrawingContainer = document.getElementById('svg-drawing');

    WebWorker.addEventListener("ServerMLResponse", async function(result) {
        console.log(result.data);
        $("#drawingcontainerid" + result.data.drawingId).addClass("on-ml-response");
        $("#drawingcontainerid" + result.data.drawingId).attr("aria-label", result.data.bestFit);

    });

    WebWorker.addEventListener("newGlyphFragment", async function(result) {
    //var $polylineClone = $("#svg-drawing > :last-child").clone();
    //$polylineClone.attr("points", "");
    //$("#svg-drawing").append($polylineClone);
    });

    WebWorker.addEventListener("returnCoordinates", async function(result) {
        let width = $("#svg-drawing").width();
        let height = $("#svg-drawing").height();

        let progress = result.data.progress;
        let pointx = width - (result.data.coordinates.x * width) - 1;
        let pointy = result.data.coordinates.y * height;

        var point = svgDrawingContainer.createSVGPoint();
        point.x = pointx;
        point.y = pointy;

        //easier to use vanilla JS to retreive the DOMElement as thats what is needed
        //to access the points attribute
        var polyline = document.getElementById("svg-drawing").lastElementChild;
        polyline.points.appendItem(point);
        $(".meter > span").css("width", (progress / 79) * 100 + "%");
    });

    WebWorker.addEventListener("characterDrawn", async function(result) {

        $(".meter > span").css("width", "0%");
        const cloneCount = result.data.id;
        let $drawingContainer = $("#drawing-container");

        //easier to access points before cloning IMO.

        var polylineClonePoints = [];
        $("#svg-drawing > polyline").each(function(index) {
            //split each points array into seperate elements on every space 
            let arr = $(this).attr("points").split(' ');
            polylineClonePoints.push(...arr);
        })

        let $clone = $drawingContainer.clone(true);
        let $cloneSVG = $($clone).find("#svg-drawing");

        $clone.attr('id', 'drawingcontainerid' + cloneCount);
        $cloneSVG.attr('id', 'drawingsvgid' + cloneCount);
        $clone.attr('aria-label', "Machine Learning result pending");

        //calculate min and max points from all polylines.
        //used to define size of viewBox.
        //scales/positions polylines in new container.

        var minPoint = Math.min(...polylineClonePoints);
        var maxPoint = Math.max(...polylineClonePoints);

        $cloneSVG.attr("viewBox", `${minPoint} ${minPoint} ${maxPoint} ${maxPoint}`);

        $clone.css("width", "6rem");
        $clone.css("height", "9rem");

        $cloneSVG.css("max-width", "100%");
        $cloneSVG.css("height", "100%");

        $clone.addClass("svgCloneDiv");

        $("#mainContainer").append($clone);

        //think this is needed to actually resize/reposition the polylines in the clone
        $clone.offset();

        //remove all but one polyline from main drawing container and
        //reset points attribute
        $("#svg-drawing > polyline").not(":last-child").remove();

        //i think there is a specific function for this but if jQuery does it
        //its supported
        $("#svg-drawing > :last-child").attr("points", "");

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

    const toolbar = document.querySelector("#toolbar-mover");
    let _startY;
    let _startX;

    toolbar.addEventListener('touchstart', function(e) {

        _startY = e.touches[0].pageY;
        _startX = e.touches[0].pageX;

        // call a function whenever the cursor moves:
        toolbar.addEventListener('touchmove', toolbarTouchChange, {
            passive: true
        });

        //toolbar.addEventListener(toolbarendevent, ToolbarTouchEnd);

    }, {
        passive: true
    });

    function toolbarTouchChange(e) {
        //var event = e.changedTouches[0] === undefined ? e : e.changedTouches[0];
        //let pos3 = event.clientX;
        //let pos4 = event.clientY;
        const y = e.touches[0].pageY;
        const x = e.touches[0].pageX;

        let yScaled = y / $(document.body).outerHeight();
        yScaled *= 100;

        let xScaled = (x - $("#toolbar-container").offset().left) / $("#toolbar-container").outerWidth();
        xScaled *= 100;
        $("#toolbar").css("margin-bottom", (100 - yScaled) + "%");
        $("#toolbar").css("margin-right", (100 - xScaled) + "%");
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
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            }
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
        getCamera().then(()=>{

            $("#loading-cover").toggleClass("load-out");
            $(document).on("capture", captureFrame);
            userClickPlay();
            $("#camera-hide, #camera-show").addClass("element-hidden");
        }
        ).catch()
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

    $("#drawing-show").click(function() {
        $("#text-off-lines, #offscreencanvas").toggleClass("text-off");

    });

});
