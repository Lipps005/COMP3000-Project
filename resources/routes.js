/* 
 * Author: Samuel Lippett
 * Project: COMP3000 Coursework
 */

const ML = require("./Machine Learning");

async function processCharacter(req, res)
{
   var xpoints = req.body.xcoordinates;
   var ypoints = req.body.ycoordinates;
   
   const transformX = await ML.transformData(xpoints);
   const transformY = await ML.transformData(ypoints);
   
   const angles = await ML.anglesBetween(transformY, transformX );
   
   const bestFit = ML.fitData(angles);
   
   console.log(bestFit);
   
   res.status("200").send({result: bestFit, id: req.body.id});
}




module.exports.processCharacter = processCharacter;