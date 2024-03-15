import mongoose, { connect } from 'mongoose'

mongoose.set('strictQuery', false)

const connectToDb = async() => {
    connect(process.env.MONGO_URL)
    .then((conn) => {
        console.log('DATABASE CONNECTED');
    })
    .catch((err) => {
        console.log(err.message);
        process.exit(1)
    })
}

export default connectToDb