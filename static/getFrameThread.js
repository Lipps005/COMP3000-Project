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
    Promise.all([returnCoordinates(result), returnBitmap(result)]);

}
;

var count = 0;
var countDown = true;
var idCount = 0;
var xBefore = 0;
var yBefore = 0;

var scaledXCoords = [];
var scaledYCoords = [];
async function returnCoordinates(result) {
    let scaledx = (result.data.xcoordinate / width);
    let scaledy = (result.data.ycoordinate / height);
    
        
    let stdvX = ((result.data.xcoordinate - xBefore) ** 2);

    //let nibSize = Math.sqrt((result.data.y.mean - result.data.y.max)**2);
   // scaledy = nibSize/result.data.y.max;

    let stdvY = ((result.data.ycoordinate - yBefore) ** 2);
    
    if(stdvX == 0 || stdvY == 0)
    {
        return;
    }
    //set threshold high to elminiate "noise"

    //stdvX is not standard deviation, its variance. If the pen is moved back from
    //the camera, the 
         if(true) {
            count++;
            //console.log([scaledx, scaledy]);
            //already standardised data here, could send it to server here by
            //storing an array in this array? - would have to calculate stdv(x, y);
            //Main thread would only have to scale and draw.

            //this thread could send the result to the server.

            //accessing DOM in worker threads not allowed. Not 'safe'
            // DOM is syncronous
            // DOM is user-sensitive
            /*if (stdvY > 20) {
                console.log("Nib raised");
            self.postMessage({
                customEvent: "newGlyphFragment",
                coordinates: {
                    x: scaledx
                    //y: scaledy
                }
            });

        } else*/
            {
                console.log([result.data.xcoordinate, result.data.ycoordinate]);
                self.postMessage({
                    customEvent: "returnCoordinates",
                    progress: count,
                    coordinates: {
                        x: scaledx,
                        y: scaledy
                    }
                });
            }

        }

        if (((stdvX < 9.14 || stdvY < 9.14) && count > 34) || count == 79) {

            count = 0;
            self.postMessage({
                customEvent: "characterDrawn",
                progress: count,
                id: (idCount+=1)
            });
            //wait a second after finishing the character so they can move to a new position?
            scaledXCoords = [];
            scaledYCoords = [];

        }
 
        //xcoordinate is the mean. Maybe needs to be biased to the
        //direction the mean is moving to. 
        xBefore = result.data.xcoordinate;
        yBefore = result.data.ycoordinate;

        
        scaledXCoords.push(scaledx);
        scaledYCoords.push(scaledy);


    
}

async function returnBitmap(result) {
    await self.postMessage({

        customEvent: "returnNewContext",
        bitmap: result.data.bitmap
    });

}
