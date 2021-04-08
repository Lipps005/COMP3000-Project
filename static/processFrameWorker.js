var width, height = 0;
const betaParticle = (Math.sqrt(3)/2);

self.onmessage = async function findNib(evt) {
    const imgData = evt.data.imgData;
    const bitmap = imgData.data;

    const length = bitmap.length;

    width = evt.data.width;
    height = evt.data.height;

    var bitmapIndex = 0;
    var x = 0;
    var y = 0;

    var rollingAverage = 0;
    var maxLuma = 255;
    var maxSat = 0;

    for (let i = 0; i < height; i++) {

        for (let j = 0; j < width; j++) {
            let red = bitmap[bitmapIndex + 0];
            let green = bitmap[bitmapIndex + 1];
            let blue = bitmap[bitmapIndex + 2];
            let gw = red * 1.2 - blue - green;

            let gx = (255 - (gw - blue) + green) % 255;
            gx = gw * 1.2 % gx;
            gx *= 2;

            let average = (red + green + blue) / 3;

            let max = Math.max(red, green, blue);
            let min = Math.min(red, green, blue);

            let chromaRange = max - min;

            let saturation = 1 - (min / average);

            let chromaSat = (chromaRange * saturation);

            let luma = red*0.2989 + green*0.5870 + blue*0.1140;
            
            let huePrime = 0;
            
            let alpha, beta = 0;

            alpha = 0.5*(2*red - green - blue);
            beta = betaParticle*(green - blue);

            huePrime = Math.atan2(beta, alpha);
            chromaRange = Math.sqrt((alpha**2 + beta**2));
            
            let color = chromaRange*saturation- (chromaRange*saturation % red*saturation);
            color = color >= min && chromaSat >= red/saturation ? 255 : 0;
            //color -= color >= red/saturation ? 0 : 255;
                bitmap[bitmapIndex + 0] = color;
                bitmap[bitmapIndex + 1] = color;
                bitmap[bitmapIndex + 2] = color;









            bitmapIndex += 4;
        }

    }

    /*for(let index = 0; index < length index+=4)
        {
          let red = bitmap[index + 0];
          if(red > max)
          {
              max = red;
               maxi = index;
           }
            
        }
        maxi % width
        */
    self.postMessage({
        xcoordinate: x,
        ycoordinate: y,
        bitmap: imgData
    });
}
