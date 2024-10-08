import express from "express";
import cookies from 'cookie-parser';
import passport from "./passport.js";


const app = express();


const isProduction = false;

// session for cookies
import session from 'express-session';
import MongoDBSession from 'connect-mongodb-session';

import dotenv from 'dotenv';
dotenv.config();

let MongoSession = MongoDBSession(session);
const mongoose_uri = process.env.Mongoose_URI;

const store = new MongoSession({
    uri: mongoose_uri,
    databaseName: "testapi",
    collection: "mySessions"
})

import mongoose from "mongoose";

mongoose.connect(mongoose_uri).then((res) => {
    console.log("MongoDB connected by mongoose.")
});

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
        maxAge: 3600000*24,
        domain: isProduction? '.samuelsiu.work': '',
        path: "/"
    }
}))

app.use(passport.initialize());
app.use(passport.session());

app.use(cookies());

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", isProduction? 'samuelsiu.work': 'localhost:8010');
    res.set("Access-Control-Allow-Credentials", 'true');
    next();
});


app.get('/', (req,res) => {
    res.send('express server')
})

app.get('/login/google', passport.authenticate('google'));

app.get('/oauth2/redirect/google',
    passport.authenticate('google', { failureRedirect: '/login', failureMessage: true }),
    function(req, res) {
        req.session.isAuth = true;
        console.log("req.user:" + req.user)
        res.redirect(isProduction? client_url: "http://localhost:3000");
    });

app.listen(8010, ()=> {
    console.log('server started on port 8010')
})