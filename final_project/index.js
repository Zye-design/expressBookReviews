const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer", session({secret:"fingerprint_customer",resave: true, saveUninitialized: true})) [cite: 13]

app.use("/customer/auth/*", function auth(req,res,next){
    //Write the authentication mechanism here
    if(req.session.authorization) { // If a session exists and has authorization data
        let token = req.session.authorization['accessToken']; // Retrieve the access token from the session 
        jwt.verify(token, "access",(err,user)=>{ // Verify the JWT token
            if(!err){
                req.user = user; // If valid, attach user info to the request
                next(); // Proceed to the next middleware/route handler
            }
            else{
                return res.status(403).json({message: "User not authenticated"}) // If invalid token
            }
        });
    } else {
        return res.status(403).json({message: "User not logged in"}) // If no session authorization
    }
});
 
const PORT =5000; [cite: 14]

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
