import User from '../model/userModel.js'
import AppError from '../utills/errorUtills.js'
import emailValidator from 'email-validator'
import bcrypt from 'bcrypt'
import cloudinary from 'cloudinary'
import fs from 'fs/promises'
import sendEmail from '../utills/sendEmail.js'
import crypto from 'crypto'

const cookieOptions = {
    maxAge: 24 * 7 * 7 * 1000,
    httpOnly: true
}

const register = async (req, res, next) => {
    const { fullName, email, password } = req.body

    if (!fullName || !email || !password) {
        return next(new AppError('ALL FIELDS ARE REQUIRED', 400))
    }

    const userExists = await User.findOne({ email })
    if (userExists) {
        return next(new AppError('USER ALREADY EXISTS', 400))
    }

    const validEmail = emailValidator.validate(email)
    if (!validEmail) {
        return next(new AppError('EMAIL IS NOT VALID', 400))
    }

    try {
        const user = await User.create({
            fullName,
            email,
            password,
            avatar: {
                public_id: email,
                secure_url: ''
            }
        })

        if (!user) {
            return next(new AppError('PLEASE TRY AGAIN...', 400))
        }
        // 
        console.log(JSON.stringify(req.file));
        if (req.file) {
            try {
                const result = await cloudinary.v2.uploader.upload(req.file.path, {
                    height: 250,
                    width: 250,
                    folder: 'lms',
                    gravity: 'faces',
                    crop: 'fill'
                })

                if (result) {
                    user.avatar.public_id = result.public_id
                    user.avatar.secure_url = result.secure_url

                    fs.rm(`uploads/${req.file.filename}`)
                }

            } catch (error) {
                return next(new AppError(error.message, 400))
            }
        }
        // 
        await user.save()

        const token = user.jwtToken()

        await res.cookie("token", token, cookieOptions)

        res.status(200).json({
            success: true,
            message: 'USER REGISTER SUCCESSFULLY',
            user
        })
    } catch (error) {
        return next(new AppError(error.message, 400))
    }
}

const login = async (req, res, next) => {
    const { email, password } = req.body

    if (!email || !password) {
        return next(new AppError('ALL FIELDS ARE REQUIRED', 400))
    }

    try {
        const user = await User.findOne({ email }).select('+password')

        if (!user || !await bcrypt.compare(password, user.password)) {
            return next(new AppError('INVALID CREDENTIALS...', 400))
        }

        const token = user.jwtToken()

        await res.cookie("token", token, cookieOptions)

        res.status(200).json({
            success: true,
            message: 'USER LOGIN SUCCESSFULLY',
            user
        })
    } catch (error) {
        return next(new AppError(error.message, 400))
    }


}

const logout = (req, res, next) => {
    try {
        res.cookie('token', null, {
            maxAge: 0,
            httpOnly: true
        })

        res.status(200).json({
            success: true,
            message: 'USER LOGOUT DONE!!!'
        })
    } catch (error) {
        return next(new AppError(error.message, 400))
    }
}

const getUser = async (req, res, next) => {
    try {
        const userId = req.user.id

        const user = await User.findById(userId)

        res.status(200).json({
            success: true,
            message: 'USER GET:',
            user
        })
    } catch (error) {
        return next(new AppError(error.message, 400))
    }
}

const forgotPassword = async (req, res, next) => {

    const { email } = req.body

    if (!email) {
        return next(new AppError('EMAIL IS REQUIRED', 400))
    }

    const user = await User.findOne({ email })
    if (!user) {
        return next(new AppError('EMAIL NOT EXISTS', 400))
    }

    const resetToken = await user.generateResetPassToken()

    await user.save()

    const resetPasswordURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`

    console.log(resetPasswordURL);
    const subject = 'RESET PASSWORD'
    const message = `YOUR RESET PASSWORD URL IS ${resetPasswordURL}`
    try {
        await sendEmail(email, subject, message)

        res.status(200).json({
            success: true,
            message: `EMAIL SENT INTO ${email}`
        })
    } catch (error) {
        user.forgotPasswordToken = undefined
        user.forgotPasswordExpiry = undefined
        await user.save()
        return next(new AppError(error.message, 400))
    }

}

const resetPassword = async (req, res, next) => {

    const { resetToken } = req.params

    const { password } = req.body

    const forgotPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex')

    const user = await User.findOne({
        forgotPasswordToken,
        forgotPasswordExpiry: { $gt: Date.now() }
    })

    if (!user) {
        return next(new AppError('TOKEN IS INVALID, PLEASE TRY AGAIN', 400))
    }

    user.password = password
    user.forgotPasswordExpiry = undefined
    user.forgotPasswordToken = undefined
    user.save()

    res.status(200).json({
        success: true,
        message: 'PASSWORD CHANGE SUCCEESSFULLY...'
    })

}

const changePassword = async (req, res, next) => {
    const { password, newPassword } = req.body
    const { id } = req.user.id

    if (!password || !newPassword) {
        return next(new AppError('ALL FIELDS ARE REQUIRED', 400))
    }

    const user = await User.findOne(id).select('+password')
    if (!user) {
        return next(new AppError('USER NOT EXISTS', 400))
    }

    const isPasswordValid = !await bcrypt.compare(user.password, password)
    if (!isPasswordValid) {
        return next(new AppError('PASSWORD NOT VALID', 400))
    }

    user.password = newPassword
    await user.save()

    user.password = undefined

    res.status(200).json({
        success: true,
        message: 'PASSWORD CHANGE SUCCESSFULLY'
    })
}

const updateUser = async (req, res, next) => {
    const { fullName } = req.body
    const { id } = req.user

    const user = await User.findById(id)
    if (!user) {
        return next(new AppError('USER NOT EXISTS', 400))
    }

    if (fullName) {
        user.fullName = fullName
    }

    if (req.file) {
        await cloudinary.v2.uploader.destroy(user.avatar.public_id)

        try {
            const result = await cloudinary.v2.uploader.upload(req.file.path, {
                height: 250,
                width: 250,
                folder: 'lms',
                gravity: 'faces',
                crop: 'fill'
            })

            if (result) {
                user.avatar.public_id = result.public_id
                user.avatar.secure_url = result.secure_url

                fs.rm(`uploads/${req.file.filename}`)
            }

        } catch (error) {
            return next(new AppError(error.message, 400))
        }
    }

    await user.save()

    res.status(200).json({
        success: true,
        message: 'USER UPDATE SUCCESSFULLY'
    })
}

export {
    register,
    login,
    logout,
    getUser,
    forgotPassword,
    resetPassword,
    changePassword,
    updateUser
}