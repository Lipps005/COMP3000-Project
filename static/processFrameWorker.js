var width, height = 0;
const betaParticle = (Math.sqrt(3) / 2);
var bitmap = [];

var averageBitmap = [];
averageBitmap.length = 256 ** 3;
averageBitmap.fill(0);

for (let red = 0; red <= 255; red++) {
    for (let green = 0; green <= 255; green++) {
        for (let blue = 0; blue <= 255; blue++) {

            let H, C, redp, greenp, bluep, max, min, Chroma, color = 0;
            redp = red / 255;
            greenp = green / 255;
            bluep = blue / 255;

            max = Math.max(redp, greenp, bluep);
            min = Math.min(redp, greenp, bluep);

            C = max - min;

            let Cprime = Math.max(red, green, blue) - Math.min(red, green, blue);
            let average = (red + green + blue) / 3;

            let saturation = 1 - (Math.min(red, green, blue) / average);

            Cprime *= 1 + C;

            if (max == redp) {
                H = ((greenp - bluep) / C);
            } else if (max == greenp) {
                H = ((bluep - redp) / C) + 2;
            } else {
                H = ((redp - greenp) / C) + 4;
            }

            // H can be positive or negative angle. 
            H = H * 60;

            if (H < 0) {
                H = 360 + H;
            }

            //color = H <= 7 && Chroma > 0.48 ? 255 : 0;

            color = Cprime > 140 && (H <= 9 || H > 357) ? 255 : 0;

            averageBitmap[red * 255 * 255 + green * 255 + blue] = color;

        }

    }
}

var fromWidth, fromHeight = 0;
var toWidth, toHeight = 0;
var maxx = 300;
var maxy = 200;
var meanx = maxx;
var meany = maxy;

var maxFromHeight = 0;

var firstPass = true;
self.onmessage = async function findNib(evt) {

    if('reposition' in evt.data)
    {
        meanx = maxx = evt.data.reposition.x;
        meany = maxy = evt.data.reposition.y;
    }
    
    //console.time("timer");
    const imgData = evt.data.imgData;
    bitmap = imgData.data;
    width = evt.data.width;
    height = evt.data.height;

    let thresholdX = [meanx, meanx];
    let thresholdY = [meany, meany];
    
    fromWidth = Math.min(Math.max(maxx-50, 0), width-100);
    fromHeight = Math.min(Math.max(maxy-50, 0), height-200);
    toHeight = Math.max(Math.min(maxy+50, height), 100);
    toWidth = Math.max(Math.min(maxx+50, width), 100);
    


    let bitmapIndex = 0;
    let color = 0;
    let H, S, V, C = 0;
    let red, green, blue = 0;

    let i = 0;
    let j = 0;
    for (i = fromHeight; i < toHeight; i++) {
        for (j = fromWidth; j < toWidth; j++) {
            bitmapIndex = ((i * width) + j) * 4;
            red = bitmap[bitmapIndex + 0];
            green = bitmap[bitmapIndex + 1];
            blue = bitmap[bitmapIndex + 2];
            V = averageBitmap[red * 255 * 255 + green * 255 + blue];

            if (V > 0) {
                maxx = j;
                maxy = i;
                thresholdX.push(j);
                thresholdY.push(i);

            }
            bitmap[bitmapIndex + 0] = V;
            bitmap[bitmapIndex + 1] = V;
            bitmap[bitmapIndex + 2] = V;

        }
    }

//reduceRight(function(accumulator, currentValue, index, array))

//"filtering?"
    meanx = 1/thresholdX.length * (thresholdX.reduceRight(function(a, b) {return a + b;}));
    meany = 1/thresholdY.length * (thresholdY.reduceRight(function(a, b) {return a + b;}));

//standard deviation on pixels? Further processing?

    maxx = Math.floor(meanx);
    maxy = Math.floor(meany);

    //console.timeEnd("timer");

    self.postMessage({
        xcoordinate: maxx,
        ycoordinate: maxy,
        bitmap: imgData
    });
    
    firstPass = false;
}
