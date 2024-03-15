import AppError from "../utills/errorUtills.js"
import JWT from 'jsonwebtoken'

const jwtAuth = async (req, res, next) => {

    const token = (req.cookies && req.cookies.token) || null
    if(!token){
        return next(new AppError('TOKEN NOT EXISTS',400))
    }

    try {
        const payload = await JWT.verify(token, process.env.SECRET)
        req.user = {id: payload.id, email: payload.email, subcription: payload.subscription, role: payload.role}
    } catch (error) {
        return next(new AppError(error.message, 400))
    }

    next()
}

const authorizedRole = (...role) => async (req, res, next) => {
    const currentUserRole = req.user.role
    if(!role.includes(currentUserRole)){
        return next(new AppError('YOU HAVE NOT PERMISSION TO ACCESS URL', 400))
    }
    
    next()
}

export { 
    jwtAuth, 
    authorizedRole 
}