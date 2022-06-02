const { send } = require('express/lib/response')
const User = require('../models/User')
const ErrorResponse = require('../utils/errorResponse')
const sendEmail = require('../utils/sendEmail')
const crypto = require('crypto')

exports.register = async (req, res, next) => {
    const {username, email, password} = req.body

    try {
        const user = await User.create({
            username, email, password
        })

        sendToken(user, 201, res)
    } catch (err) {
        next(err)
    }
}

exports.login = async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ErrorResponse("Please provide an email and password", 400))
    }

    try {
        const user = await User.findOne({ email }).select("+password")

        if (!user) {
            return next(new ErrorResponse("Invalid credentials", 401))
        }

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return next(new ErrorResponse("Invalid credentials", 401))
        }

        sendToken(user, 200, res);

    } catch (err) {
        next(err)
    }
}

exports.forgotPassword = async (req, res, next) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return next(new ErrorResponse("Email could not be sent"))
        }

        const resetToken = user.getResetPasswordToken();

        await user.save()

        const resetUrl = `http://localhost:3000/passwordreset/${resetToken}`;

        const message = `
            <h1>You have requested a password reset</h1>
            <p>Please go to this link to reset your password</p>
            <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
        `

        try {
            await sendEmail({
                to: user.email,
                subject: "Password Reset Request",
                text: message
            });

            res.status(200).json({ succes: true, data: "Email Sent" })
        } catch (err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpired = undefined;

            await user.save()

            return next(new ErrorResponse("Email could not be sent", 500))
        }
    } catch (err) {
        next(err);
    }
}

exports.resetPassword = async (req, res, next) => {
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.resetToken)
                                     .digest("hex");

    try {
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpired: {$gt : Date.now()}
        })

        if (!user) {
            return next(new ErrorResponse("Invalid Reset Token", 400))
        }

        user.password = req.body.password;
        user.resetPasswordToken =undefined;
        user.resetPasswordExpired =undefined;

        await user.save();

        res.status(201).json({
            succes: true,
            data: "Password Reset Success"
        });
    } catch (err) {
        next(err);
    }
}

const sendToken = (user, statusCode, res) => {
    const token = user.getSignedToken()
    res.status(statusCode).json({ succes: true, token })
}