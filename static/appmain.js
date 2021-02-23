/* 
 * Author: Samuel Lippett
 * Project: COMP3000 Coursework
 */

const event = new CustomEvent('capture', {detail: "capture event"});

var t0;
var t1;
var track;
var mediaStream;
var imageCapture;
function dispatchCaptureEvent()
{
   t0 = performance.now();
   document.dispatchEvent(event);

}
//dispatchCaptureEvent();

var interval = setInterval(dispatchCaptureEvent, (1 / 20) * 1000);



if ("serviceWorker" in navigator)
{
   var sworker = navigator.serviceWorker.register('service-worker.js');
}

function getCamera()
{
   return navigator.mediaDevices.getUserMedia({video: true})
           .then(gotMedia)
           .catch(err => console.error('getUserMedia() failed: ', err));
}

function gotMedia(mediastream) {
   mediaStream = mediastream;
   track = mediastream.getVideoTracks()[0];
   imageCapture = new ImageCapture(track);
   const video = document.createElement('video');
   video.srcObject = mediaStream;
   video.play();
   track.onmute = function (evt)
   {
      evt.preventDefault();
      console.log("muted");
      $(document).unbind("capture");

   };

   track.onunmute = function (evt)
   {
      console.log("unmuted");
      $(document).on("capture", captureFrame);

   };

   track.ended = function (evt)
   {
      console.log("ended");
   };
}

function captureFrame(e)
{
   if (track.readyState === "live" && track.muted === false && track.enabled === true)
   {
      imageCapture.grabFrame()
              .then(processFrame)
              .then(() => {
                 t1 = performance.now();
                 console.log("Call to doSomething took " + (t1 - t0) + " milliseconds.");
              })
              .catch(err => console.error('grabFrame() failed: ', track.enabled));

   }
}


function processFrame(imgData) {
   console.log("processing");
}



$(document).ready(function () {

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


   var pos1 = 0,
           pos2 = 0,
           pos3 = 0,
           pos4 = 0;

   $("#toolbar-mover").on("mousedown touchstart", function (e) {
      e = e.changedTouches[0] || e;

      // get the mouse cursor position at startup:
      pos3 = e.clientX;
      pos4 = e.clientY;
      // call a function whenever the cursor moves:
      $("body").on("mousemove touchmove", mousemover);

      $("body").on("mouseup touchend", mouseupevent);

   });

   function mousemover(e) {
      e = e.changedTouches[0] || e;
      // calculate the new cursor position:
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;

      // set the element's new position:
      $("#toolbar").css("top", ($("#toolbar").offset().top - pos2) + "px");
      if ($("#toolbar").offset().top <= 0) {
         $("#toolbar").css("top", 0 + "px");
      }
      if (($("#toolbar").offset().top >= $(window).height() - $("toolbar").outerHeight(true))) {
         $("#toolbar").css("top", $(window).height() - $("toolbar").outerHeight(true) + "px");
      }
      $("#toolbar").css("left", ($("#toolbar").offset().left - pos1) + "px");
      if ($("#toolbar").offset().left <= 0) {
         $("#toolbar").css("left", 0 + "px");
      }
      if ($("#toolbar").offset().left >= $(window).width() - $("toolbar").outerWidth(true)) {
         $("#toolbar").css("left", $(window).width() - $("toolbar").outerWidth(true) + "px");
      }
   }
   ;

   function mouseupevent() {
      /* stop moving when mouse button is released:*/
      $("body").unbind("mousemove touchmove");
      $("body").unbind("mouseup touchend");
   }

   function userClickPause()
   {
      console.log("pause");
      try
      {
         track.enabled = false;
         $(".toolbar-contents:nth-child(2)").css("display", "inline");
         $(".toolbar-contents:nth-child(1)").css("display", "none");
      } catch (err)
      {
         console.log("track not defined");
      }

   }
   ;

   function userClickPlay()
   {
      console.log("play");
      try
      {
         track.enabled = true;

         $(".toolbar-contents:nth-child(2)").css("display", "none");
         $(".toolbar-contents:nth-child(1)").css("display", "inline");

      } catch (err)
      {
         console.log("track not defined");
      }

   }
   $(window).on("blur", userClickPause);
   $(".toolbar-contents:nth-child(1)").click(userClickPause);

   $(".toolbar-contents:nth-child(2)").click(userClickPlay);



   $("#toolbar-pen").click(async function ()
   {
      await getCamera();
      $(document).on("capture", captureFrame);
      $(".toolbar-contents:nth-child(2)").click(userClickPlay);
      $(this).toggleClass("toolbar-pen-inactive");

   });

   $(window).resize(function ()
   {
      $("#toolbar").css("top", $("body").height() - $("toolbar").outerWidth(true) + "px");
   });
});
