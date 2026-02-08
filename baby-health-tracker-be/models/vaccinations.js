const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const vaccinationSchema = new Schema({
    baby_id: {
        type: Schema.Types.ObjectId,
        ref: 'Baby',
        required: true
    },
    vaccine_name: {
        type: String,
        required: true
    },
    dose_number: {
        type: Number,
        required: true
    },
    vaccination_date: {
        type: Date,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    image_url: {
        type: String,
        required: false
    },
    //chi nhanh tiem chung
    clinic_branch: [
        {
            branch_name: {
                type: String,
                required: true
            },
            location: {
                type: String,
                required: true
            }
        }
    ]
});

module.exports = mongoose.model('Vaccinations', vaccinationSchema);