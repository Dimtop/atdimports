

//Libraries
const path = require("path");
const express = require("express");
const cors = require('cors');
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const cron = require('node-cron');


//Routers
const atdRouter = require("./routers/atd.router");


//Initiallizing the app
const app = express();
const httpServer = require("http").createServer(app);

//Configurations
dotenv.config();

//Middleware configuration
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.urlencoded({extended:false}));
app.use(bodyParser.json());


//Routing
app.use("/api/atd",atdRouter)


httpServer.listen(process.env.PORT, (err)=>{
    if(err){
        console.log(err);
    }
    else{
        console.log("Running on: " +process.env.PORT)

    }
});







