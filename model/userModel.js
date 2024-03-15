import { Schema, model } from 'mongoose'
import JWT from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import crypto from 'crypto'

const userSchema = new Schema({
    fullName: {
        type: 'string',
        required: [true, 'NAME IS REQUIRED'],
        trim: true,
        lowercase: true
    },
    email: {
        type: 'String',
        required: [true, 'EMAIL IS REQUIRED'],
        unique: true,
        lowercase: true
    },
    password: {
        type: 'String',
        required: [true, 'PASSWORD IS REQUIRED'],
        select: false,
        minLength: [8, 'PASSWORD SHOULD BE MUST 8 CHARACTER']
    },
    role: {
        type: 'String',
        enum: ['USER', 'ADMIN'],
        default: 'USER'
    },
    avatar: {
        public_id: {
            type: 'String'
        },
        secure_url: {
            type: 'String'
        }
    },
    forgotPasswordToken: String,
    forgotPasswordExpiry: Date
}, {
    timestamps: true
})

userSchema.pre('save', async function(next) {
    if(!this.isModified('password')){
        return next()
    }

    this.password = await bcrypt.hash(this.password, 10)
    return next()
})

userSchema.methods = {
    jwtToken() {
        return JWT.sign(
            { id: this._id, email: this.email, subscription: this.subscription, role: this.role },
            process.env.SECRET,
            { expiresIn: '24h' }
        )
    },

    generateResetPassToken() {
        const resetToken = crypto.randomBytes(20).toString('hex')

        this.forgotPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')
        this.forgotPasswordExpiry = Date.now() + 15 * 60 * 1000 ;

        return resetToken
    }
}

export default model('User', userSchema)