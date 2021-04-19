/* 
 * Author: Samuel Lippett
 * Project: COMP3000 Coursework
 */
 


var processFrameThread = new Worker("processFrameWorker.js");
var buffer;
var canvas;
var canvasContext;
var width, height = 0;
var queryableFunctions = {
    "transferCanvas": function(evt) {
        width = evt.data.width;
        height = evt.data.height;
        canvas = new OffscreenCanvas(width,height);
        canvasContext = canvas.getContext("2d");
        console.log(canvas);

    },

    "transferImageBitmap": async function(evt) {

        /*
      getting the context of the canvas using bitmaprenderer returns
      an ImageBitmapRenderingContext object. 
      This is a "performance-orientated interface" that minimises memory
      overhead such as copying data, and improves performance by avoiding
      "intermediate compositing"; that is, for example, by not pre-rendering
      the imageData with the alpha background to create the appearance of 
      transparency. However, using the bitmaprenderer context peramenantly 
      binds this context to the canvas, meaning you are unable to access the
      image data.
      var context = canvas.getContext("bitmaprenderer");
       console.log(evt.data.bitmap);
      context.transferFromImageBitmap(evt.data.bitmap);
      console.log(canvas); 
      */

        canvasContext.drawImage(evt.data.bitmap, 0, 0);
        //getImageData returns an ImageData object, which has a uint8 1d array containing
        //the actual pixel data. 

        let data = await canvasContext.getImageData(0, 0, width, height);
        processFrameThread.postMessage({
        imgData: data,
        width: width,
        height: height
    });

    }
};

self.onmessage = async function(evt) {
    queryableFunctions[evt.data.customEvent].call(self, evt);
}
;

processFrameThread.onmessage = async function(result) {
    await Promise.all([returnCoordinates(result), returnBitmap(result)]);

}
;

async function returnCoordinates(result) {
    let scaledx = (result.data.xcoordinate/width);
    let scaledy = (result.data.ycoordinate/height);
    //console.log([scaledx, scaledy]);
    //already standardised data here, could send it to server here by
    //storing an array in this array? - would have to calculate stdv(x, y);
    //Main thread would only have to scale and draw.

    //this thread could send the result to the server.
    
    //accessing DOM in worker threads not allowed. Not 'safe'
    // DOM is syncronous
    // DOM is user-sensitive
    self.postMessage({
        customEvent: "returnCoordinates",
        coordinates: {
            x: scaledx,
            y: scaledy
        }
    });

    //console.log([result.data.xcoordinate, result.data.ycoordinate]);

}

async function returnBitmap(result) {
    await self.postMessage({

        customEvent: "returnNewContext",
        bitmap: result.data.bitmap
    });

}

