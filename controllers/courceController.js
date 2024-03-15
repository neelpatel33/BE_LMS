import Cource from '../model/courceModel.js'
import AppError from '../utills/errorUtills.js'
import cloudinary from 'cloudinary'
import fs from 'fs/promises'

const getAllCources = async (req, res, next) => {
    try {
        const cources = await Cource.find({}).select('-lectures')

        res.status(200).json({
            success: true,
            message: 'THIS IS ALL COURCES',
            cources
        })
    } catch (error) {
        return next(new AppError(error.message, 400))
    }
}

const getLecturesByCourceId = async (req, res, next) => {
    try {
        const { id } = req.params

        const cource = await Cource.findById(id)

        res.status(200).json({
            success: true,
            message: 'COURCE LECTURES FETCHED DONE',
            lectures: cource.lectures
        })
    } catch (error) {
        return next(new AppError(error.message, 400))
    }
}

const createCource = async (req, res, next) => {
    const { title, description, category, createBy } = req.body

    if (!title || !description || !category || !createBy) {
        return next(new AppError('ALL FIELDS ARE REQUIRED', 400))
    }

    try {
        const cource = await Cource.create({
            title,
            description,
            category,
            createBy,
            thumbnail: {
                public_id: 'Dummy',
                secure_url: 'Dummy'
            }
        })

        if (!cource) {
            return next(new AppError('COURCE NOT CREATE, TRY AGAIN', 400))
        }

        if (req.file) {
            try {
                const result = await cloudinary.v2.uploader.upload(req.file.path, {
                    folder: 'lms'
                })

                if (result) {
                    cource.thumbnail.public_id = result.public_id
                    cource.thumbnail.secure_url = result.secure_url

                    fs.rm(`uploads/${req.file.filename}`)
                }
            } catch (error) {
                return next(new AppError(error.message, 400))
            }
        }

        await cource.save()

        res.status(200).json({
            success: true,
            message: 'COURCE CREATED DONE!!',
            cource
        })
    } catch (error) {
        return next(new AppError(error.message, 400))
    }
}

const updateCource = async (req, res, next) => {

    try {
        const { id } = req.params

        const cource = await Cource.findByIdAndUpdate(
            id,
            {
                $set: req.body
            },
            {
                runValidators: true
            }
        )
        if (!cource) {
            return next(new AppError('Cource with this id not exists', 400))
        }

        res.status(200).json({
            success: true,
            message: 'UPDATE COURCE SUCCESSFULLY',
            cource
        })
    } catch (error) {
        return next(new AppError(error.message, 400))
    }
}

const deleteCource = async (req, res, next) => {
    try {
        const { id } = req.params

        const cource = await Cource.findById(id)

        if (!cource) {
            return next(new AppError('Cource with this id not exists', 400))
        }

        await Cource.findByIdAndDelete(id)

        res.status(200).json({
            success: true,
            message: 'COURCE DELETE'
        })
    } catch (error) {
        return next(new AppError(error.message, 400))
    }
}

const AddLectureToCourceById = async (req, res, next) => {
    const { title, description } = req.body
    const { id } = req.params

    if(!title || !description){
        return next(new AppError('ALL FIELDS ARE REQUIRED', 400))
    }

    const cource = await Cource.findById(id)
    if(!cource){
        return next(new AppError('Cource not exists', 400))
    }

    const lecturesData = {
        title,
        description,
        lecture: {}
    }

    if (req.file) {
        try {
            const result = await cloudinary.v2.uploader.upload(req.file.path, {
                folder: 'lms'
            })

            if (result) {
                lecturesData.lecture.public_id = result.public_id
                lecturesData.lecture.secure_url = result.secure_url

                fs.rm(`uploads/${req.file.filename}`)
            }
        } catch (error) {
            return next(new AppError(error.message, 400))
        }
    }

    cource.lectures.push(lecturesData)

    cource.numbersOfLecture = cource.lectures.length

    await cource.save()

    res.status(200).json({
        success: true,
        message: 'LECTURES SUCCESSFULYY ADDED',
        cource
    })
}

export {
    getAllCources,
    getLecturesByCourceId,
    createCource,
    updateCource,
    deleteCource,
    AddLectureToCourceById
}