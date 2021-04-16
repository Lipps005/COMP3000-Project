/* 
 * Author: Samuel Lippett
 * Project: COMP3006 Coursework
 */

const express = require("express");
const path = require("path");
const cors = require("cors");
let http = require("http");
// Initialise the app.
app = express();

const PORT = 5000;

app.use(cors());

// Set up the static files.
app.use(express.static(path.join('', "static")));
app.use(express.static(path.join('../', "static")));
// Setup the app to use EJS templates.
app.set("views", path.join('', "views"));
app.set("view engine", "ejs");

// Enable processing of post forms.
app.use(express.urlencoded({extended: true}));

// Start the app.
app.listen(PORT, function () 
{
   console.log(`Listening on ${ PORT }`);
});

app.get("/index", (req, res) =>
{
  res.render("index", {});
});

app.get("/app", (req, res) =>
{
  res.render("app", {});
});

app.post("/newimage", (req, res) =>
{
  res.send("ok");
});

httpserver = http.createServer(app);

var connections = {};

//set up websocket, use cross-origin resource sharing.
const io = require('socket.io')(httpserver, {
   cors: {
      origin: '*'
   }
});

//run server.
httpserver.listen(3000, function () {
   console.log("Listening on 3000");
});



// "On connection" handler.
io.on("connection", function (socket) {
   console.log("a user connected");


   socket.on("test", async function (msg) {

console.log(msg);
         let H, S, V, C, color = 0;

//                let red = msg.data.red / 255;
//                let green = msg.data.green / 255;
//                let blue = msg.data.blue / 255;
//
//                let max = Math.max(red, green, blue);
//                let min = Math.min(red, green, blue);
//
//                V = max;
//                C = max - min;
//
//                if (max === red) {
//                    H = ((green - blue) / C);
//                } else if (max === green) {
//                    H = ((blue - red) / C) + 2;
//                } else {
//                    H = ((red - green) / C) + 4;
//                }
//
//                // H can be positive or negative angle. 
//                H = H * 60;
//
//                if (H < 0) {
//                    H = 360 + H;
//                }
//
//                if (V !== 0) {
//                    S = (C / V);
//                }
//
//                color = H <= 7 && C > 0.5 ? 255 : 0;

               socket.emit("result", {color: color});


      });
      

   




});