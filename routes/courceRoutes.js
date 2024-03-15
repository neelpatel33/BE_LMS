import { Router } from 'express'

import { getAllCources, getLecturesByCourceId, AddLectureToCourceById, createCource, updateCource, deleteCource } from '../controllers/courceController.js'

import upload from '../middlewares/multerMiddleware.js'
import { jwtAuth, authorizedRole } from '../middlewares/userMiddleware.js';


const courceRouter = new Router()

// courceRouter.get('/', getAllCources)
courceRouter.route('/')
    .get(getAllCources)
courceRouter.get('/:id', jwtAuth, getLecturesByCourceId)

courceRouter.post('/:id', jwtAuth, authorizedRole('ADMIN'), upload.single('lecture'), AddLectureToCourceById)
courceRouter.post('/create-cource', jwtAuth, authorizedRole('ADMIN'), upload.single('thumbnail'), createCource)
courceRouter.put('/update-cource/:id', jwtAuth, authorizedRole('ADMIN'), updateCource)
courceRouter.delete('/delete-cource/:id', jwtAuth, authorizedRole('ADMIN'), deleteCource)

export default courceRouter