import { Router } from 'express'

import { changePassword, forgotPassword, getUser, login, logout, register, resetPassword, updateUser } from '../controllers/userController.js'
import {jwtAuth} from '../middlewares/userMiddleware.js'
import upload from '../middlewares/multerMiddleware.js'

const userRouter = new Router()

userRouter.post('/register', upload.single('avatar'), register)
userRouter.post('/login', login)
userRouter.get('/logout', logout)
userRouter.get('/me', jwtAuth, getUser)
userRouter.post('/reset', forgotPassword)
userRouter.post('/reset/:resetToken', resetPassword)
userRouter.post('/change-password', jwtAuth, changePassword)
userRouter.put('/update/:id', jwtAuth, upload.single('avatar'), updateUser)

export default userRouter