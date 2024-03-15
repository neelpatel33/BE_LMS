import { Schema, model } from 'mongoose'

const courceModel = new Schema({
    title: {
        type: 'String',
        required: [true, 'TITLE IS REQUIRED'],
        minLength: [8, 'TITLE MUST BE ATLEAST 8 CHARACTERS'],
        maxLength: [60, 'TITLE SHOULD BE LESS THAN 60 CHARACTER'],
        trim: true
    },
    description: {
        type: 'String',
        required: [true, 'TITLE IS REQUIRED'],
        minLength: [8, 'TITLE MUST BE ATLEAST 8 CHARACTERS'],
        maxLength: [200, 'TITLE SHOULD BE LESS THAN 200 CHARACTER']
    },
    category: {
        type: 'String',
        required: [true, 'CATEGORY IS REQUIRED']
    },
    thumbnail: {
        public_id: {
            type: 'String',
            required: true
        },
        secure_url: {
            type: 'String',
            required: true
        }
    },
    lectures: [{
        title: String,
        description: String,
        lecture: {
            public_id: {
                type: 'String',
                required: true
            },
            secure_url: {
                type: 'String',
                required: true
            }
        }
    }],
    numbersOfLecture: {
        type: Number,
        default: 0
    },
    createBy: {
        type: String,
        required: true
    }
}, {
    timestamps: true
})

export default model('Cource', courceModel)