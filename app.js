import express from 'express'
import {config} from 'dotenv'
config()
import connectToDb from './database/db.js'
import userRouter from './routes/userRoutes.js'
import errorMiddleware from './middlewares/errorMiddleware.js'
import cookieParser from 'cookie-parser'
import courceRouter from './routes/courceRoutes.js'

// make server
const app = express()

// database connectivity
connectToDb()

app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({extended: true}))

// routes
app.use('/api/v1/user', userRouter)
app.use('/api/v1/cources', courceRouter)

app.all('*', (req, res) => {
    res.send('OPPS! PAGE NOT FOUND')
})

// error middleware
app.use(errorMiddleware)

export default app