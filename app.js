import express from "express";
import cookies from 'cookie-parser';

import ServerlessHttp from "serverless-http";
// import passport from "passport";
// import jwt from "jsonwebtoken";
// import { MongoClient } from "mongodb";



// session for cookies
import session from 'express-session';
import MongoDBSession from 'connect-mongodb-session';

import dotenv from 'dotenv';
dotenv.config();

import passport from "passport";

const client_url = process.env.CLIENT_URL
const isProduction = process.env.IS_PRODUCTION === "true";

let MongoSession = MongoDBSession(session);
const mongoose_uri = process.env.MONGOOSE_URI;

const app = express();

const store = new MongoSession({
    uri: mongoose_uri,
    databaseName: "testapi",
    collection: "consSessions"
})

import mongoose from "mongoose";

mongoose.connect(mongoose_uri).then((res) => {
    console.log("MongoDB connected by mongoose.")
});

import passportSetup from "./passport.js"

app.set('trust proxy', 1)

import cors from "cors";
import UserModel from "./Model/UserModel.js";

// app.use(cors({
//     credentials: true,
// }))



app.use(session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
        secure: isProduction? true : false, 
        sameSite: isProduction? 'none' : 'lax',
        partitioned: isProduction? true : false,
        httpOnly: true,
        maxAge: 3600000*5,
        domain: isProduction? '.samuelsiu.work': 'localhost',
        path: "/"
    }
}))

app.use((req, res, next) => {
    // console.log("Access-Control-Allow-Origin", isProduction? client_url: 'http://localhost:3000', isProduction)
    res.setHeader("Access-Control-Allow-Origin", isProduction? client_url: 'http://localhost:3000');
    res.set("Access-Control-Allow-Credentials", 'true');
    res.set("Access-Control-Allow-Headers", 'content-type')
    next();
});

app.use(passport.initialize());
app.use(passport.session());

app.use(cookies());



// for parsing body (post)
app.use(express.urlencoded({extended: true}))


app.get('/', (req,res) => {
    res.send('express server')
})

app.get('/login/google', passport.authenticate('google'));

app.get('/oauth2/redirect/google',
    passport.authenticate('google', { 
        failureRedirect: '/login', 
        failureMessage: true }),
    function(req, res) {
        req.session.isAuth = true;
        console.log("req.user:" + req.user)
        res.redirect(isProduction? client_url: "http://localhost:3000");
    });

// check login or not
app.get("/login", (req, res) => {
    console.log(req.session, req.session.isAuth)
    
    if (req.session.passport) {
        res.send(true)
    } else {
        res.send(false)
    }
}
)

app.post("/logout", (req, res, next) => {
    console.log("logging out" + req.session)
    // req.logout((error) => {
    //     if (error) console.log(`unable to logout`, error);
    //   });
    // req.session.isAuth
    // req.logout(err=>{
    //     if (err) throw err;
    // });
    // req.session = null;
    // res.redirect("/");
    // req.session.destroy((err) => {
    // if (err) {
    //     // res.status(500).send("cannot destroy")\
    //     return next(err);
    // }
    req.logout((err) => {
        if (err) {
          return next(err);
        }
        req.session.destroy((err) => {
          if (err) {
            return next(err);
          }
          res.redirect('/');
        });
      });
    // req.logout(err => {
    //     if (err) {
    //         res.status(500).send("cannot logout")
    //     }
    //     res.clearCookie('connect.sid');
    //     res.status(200).send('logged out')
    // })
    
    // res.status(200).send('logged out')
    // res.redirect(isProduction? client_url: "http://localhost:3000");
    
    // })
    // bug: cannot destroy session and cannot clearCookie
    
    console.log(req.session)
    // console.log('session destroyed')
    // res.send("how")
})


app.post("/update", async (req, res) => {
    console.log(req.body)
    const {ToDo, startTime, accumulatedTime} = req.body;
    const id = req.session.passport? req.session.passport.user : undefined;
    const currentDate = new Date().toJSON().slice(0,10);


    console.log(id, currentDate)

    if (id) {
        const user = await UserModel.findOne({_id: id});
        console.log('user: ' + user)

        // have to check if todo exist, then check if today exist
        const checkToDo = await UserModel.findOne(
            {_id: id,
                [ToDo] : {$exists: true}
            }
        )
        console.log("checkToDo: " + checkToDo)
        if (checkToDo) {
            const qtitle = ToDo + '.' + currentDate;
            const checkDate = await UserModel.findOne(
                {
                    _id: id,
                    [qtitle]: {$exists: true}
                }
            )
            console.log('checkDate: ' + checkDate)
            if (checkDate) {
                // add time to the same date (first would delay? cuz didnt print newUser lol)
                await UserModel.updateOne(
                    {_id: id}, 
                    {$inc: {[qtitle]: accumulatedTime}}
                )
            } else {
                // add new date (havent checked)
                const newUser = await UserModel.updateOne(
                    {_id: id},
                    {$set: {[qtitle]: parseInt(accumulatedTime)}}
                )
                console.log(newUser)
            }
        }
        // new Todo V
        else {
            // user[ToDo] = {
            //     [currentDate] : accumulatedTime
            // }
            // let newUser = await user.save();
            const newUser = await UserModel.findByIdAndUpdate(
                id,
                {[ToDo]: {[currentDate] : parseInt(accumulatedTime)}},
                {new: true}
            )
            console.log(newUser)
        }
        
        res.send('updated')

    }

})

app.get("/7days", async (req, res) => {
    const id = req.session.passport? req.session.passport.user : undefined;
    

    if (id) {
        const currentDate = new Date();
        const sevenDaysAgo = new Date(currentDate.setDate(currentDate.getDate() - 7));
        console.log('sevendaysago: ' + sevenDaysAgo)
        const data = await UserModel.find(
            {_id: id},
            {_id:0, username: 0, email: 0, __v: 0}
        )
        console.log(data)
        res.send(data)
    } else {
        res.send('please first login')
    }
    
})



app.listen(8010, ()=> {
    console.log('server started on port 8010')
})


// export const handler =  ServerlessHttp(app)