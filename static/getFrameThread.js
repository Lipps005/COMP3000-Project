/* 
 * Author: Samuel Lippett
 * Project: COMP3000 Coursework
 */
var canvas;
var width, height;
var queryableFunctions = {
    "transferCanvas" : function(evt)
    {
      width = evt.data.width;
      height = evt.data.height;
      canvas = new OffscreenCanvas(width, height);
      console.log(canvas);

    },

    "transferImageBitmap" : function(evt)
    {
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

      canvas.getContext("2d").drawImage(evt.data.bitmap, 0, 0);
      var data = canvas.getContext("2d").getImageData(0, 0, width, height);
    }
};


self.onmessage = function(evt)
{
  queryableFunctions[evt.data.customEvent].call(self, evt);
}

