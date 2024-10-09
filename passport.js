import GoogleStrategy from "passport-google-oauth20";
import passport from "passport";
import UserModel from "./Model/UserModel.js";

import dotenv from 'dotenv';
dotenv.config();

passport.use(new GoogleStrategy(
    {
        clientID: process.env.Client_ID,
        clientSecret: process.env.Client_SECRET,
        callbackURL: "/oauth2/redirect/google",
        scope: ["profile","email"]
    },

    async function (req, accessToken, refreshToken, profile, callback) {
            console.log(req.session)
            console.log(profile)
            let user = await UserModel.findOne({email: profile.emails[0].value})
            console.log(user)
            // first: check if any records (email)
            if (user) {
                console.log("user found")
                return callback(null, user)
            } else { //update a new user
                console.log('creating account')
                // check if same name taken?
                const username = profile.displayName;
                const email = profile.emails[0].value;
                console.log(username, email)

                user = new UserModel({
                    username,
                    email
                });
            
                await user.save()
                .then(savedUser => {
                    console.log(savedUser)
                }).catch((err) => {
                    console.log(err)
                })
                return callback(null, user)
            }            
        }
));

passport.serializeUser((user, done) => {
    console.log("serializing: " + user)
    return done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
    console.log("deserializing: " + id)
    let deUser = await UserModel.findOne({_id: id})
    console.log(deUser)
    done(null, deUser); 
});

export default passport;