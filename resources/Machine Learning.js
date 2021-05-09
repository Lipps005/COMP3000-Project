/* 
 * Author: Samuel Lippett
 * Project: COMP3000 Coursework
 */
const TEST_CHAR_ANGLES = {
 "_AVERAGE_O" : [
   1.07117791,
   1.07685123,
   1.084962242,
   1.126830619,
   1.173673274,
   1.188330677,
   1.231775753,
   1.277171512,
   1.343613473,
   1.385752468,
   1.441552248,
   1.505278179,
   1.516379618,
   1.545933287,
   1.49921526,
   1.351055458,
   1.087714139,
   0.732871157,
   0.385531607,
   0.158645283,
   0.085432967,
   0.010802511,
   0.080038964,
   0.152749595,
   0.179668901,
   0.255463044,
   0.284102644,
   0.376718194,
   0.429767077,
   0.54623459,
   0.629055567,
   0.690978843,
   0.73750937,
   0.783880161,
   0.831446221,
   0.871242258,
   0.892723782,
   0.928058788,
   0.954031606,
   0.971493661,
   0.989854756,
   1.013208177,
   1.023220501,
   1.028006543,
   1.034912727,
   1.043955589,
   1.053618948,
   1.066832043,
   1.071377605,
   1.072995036,
   1.074435603,
   1.077844854,
   1.039942647,
   1.041833944,
   1.038851886
],

"_AVERAGE_X" : [
   0.980665944,
   0.533290135,
   0.553207807,
   0.521817772,
   0.461336624,
   0.276691669,
   0.301351046,
   0.288912191,
   0.270076224,
   0.259572852,
   0.231584826,
   0.204855004,
   0.16049647,
   0.170217908,
   0.191255048,
   0.267381118,
   0.438611667,
   0.633264163,
   0.846007897,
   1.047176378,
   1.239386076,
   1.332692879,
   1.407772643,
   1.423875349,
   1.368624495,
   1.289804672,
   1.262032187,
   1.22996242,
   1.242763419,
   1.283036792,
   1.49207011,
   0,
   0.767606565,
   0.745844263,
   0.81805057,
   0.830448442,
   0.832839446,
   0.830833391,
   0.82614992,
   0.795491951,
   0.78452468,
   0.767149211,
   0.763272273,
   0.760337132,
   0.765997171,
   0.762145041,
   0.768178457,
   0.767331072,
   0.774314917,
   0.774971327,
   0.771493209,
   0.771917378,
   0.768771635,
   0.767451382,
   0.766372951
]
};

const threshold = 100;
async function transformDatapoints(arr)
{

   //var result = arr.map(x => x - 1);
   var min = Math.min(...arr);
   var translated = [];
   for (let i = 0; i < arr.length; i++)
   {
      translated.push(arr[i] - min);
   }
   var max = Math.max(...translated);
   var scaled = [];
   for (let i = 0; i < translated.length; i++)
   {
      scaled.push(translated[i]/max);
   }


   return scaled;
}

async function calculateAngles(x, y)
{
   var loopCount = x.length = y.length = Math.min(x.length, y.length);
   var result = [];
   for (let i = 0; i < loopCount; i++)
   {
      result.push(Math.atan2(x[i], y[i]));
   }
   return result;
}

function MSE(dataset1, dataset2)
{
   if(dataset1.length !== dataset2.length)
   {
      return null;
   }
   let MSE = 0;
   for(let i = 0; i < dataset1.length; i++)
   {
      dataset1[i] = (dataset1[i] - dataset2[i])**2;
   }
   
   MSE = 1/dataset1.length * (dataset1.reduceRight(function(a, b) {return a + b;}));
   
   return MSE;
}

function fitData(angles)
{
   //proof-of-concept: We are able to differentiate between characters in this way
   //The series of angles are different enough that perhaps they can be compared 
   //in this way?
   
   var meanO = MSE(angles, TEST_CHAR_ANGLES._AVERAGE_O);
   var meanX = MSE(angles, TEST_CHAR_ANGLES._AVERAGE_X);
   
   if(meanO > threshold || meanX > threshold)
   {
      return "Other";
   }
   else
   {
     return meanO > meanX ? "X" : "O"; 
   }
   
}

module.exports.transformData = transformDatapoints;
module.exports.anglesBetween = calculateAngles;
module.exports.fitData = fitData;