const LocalStrategy = require('passport-local').Strategy
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

require('../models/Users')
const e = require("express");
const User = mongoose.model('users')

module.exports = (passport) => {
    passport.use(new LocalStrategy({usernameField: 'email'}, (email, password, done) => {
        User.findOne({email}).lean().then((user) => {
            if(!user){
                return done(null, false, {message: 'Essa conta não existe!'})
            }else{
                bcrypt.compare(password, user.password, (error, equals) => {
                    if (equals){
                        return done(null, user)
                    }else{
                        return done(null, false, {message: 'Senha incorreta!'})
                    }
                })
            }
        })
    }))

    passport.serializeUser((user, done) => {
        done(null, user._id)
    })

    passport.deserializeUser((id, done) => {
        User.findOne({'_id':id}).lean().then((user) => {
            done(null, user)
        })
    })
}