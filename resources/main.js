/* 
 * Author: Samuel Lippett
 * Project: COMP3006 Coursework
 */

const express = require("express");
const path = require("path");
const cors = require("cors");
let http = require("http");

let port = 9000;

// Initialise the app.
app = express();

app.use(cors());

// Set up the static files.
app.use(express.static(path.join('../', "static")));


// Setup the app to use EJS templates.
app.set("views", path.join('../', "views"));
app.set("view engine", "ejs");

// Enable processing of post forms.
app.use(express.urlencoded({extended: true}));

// Start the app.
app.listen(port, '192.168.1.47', function () {
   console.log("Listening on " + port);
});

app.get("/index", (req, res) =>
{
   res.render("index", {});
});