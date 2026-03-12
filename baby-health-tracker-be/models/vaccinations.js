const mongoose = require("mongoose");

const vaccinationScheduleItemSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true },
    desc: { type: String, trim: true },
  },
  { _id: false },
);

const vaccinationSchema = new mongoose.Schema(
  {
    vaccine_name: { type: String, required: true },
    dose_number: { type: Number, default: 1 },
    price: { type: Number, default: 0 },
    location: [{ type: mongoose.Schema.Types.ObjectId, ref: "HospitalBranch" }],

    // Additional fields aligned with BeTiny vaccinationCatalog data
    doses: { type: String, trim: true },
    is_oral: { type: Boolean, default: false },
    summary: { type: String, trim: true },
    detail: { type: String, trim: true },
    age_range: { type: String, trim: true },
    origin: { type: String, trim: true },
    schedule: [vaccinationScheduleItemSchema],
    side_effects: [{ type: String, trim: true }],
    contraindication: { type: String, trim: true },
    prevention_desc: { type: String, trim: true },
    prevention_solution: { type: String, trim: true },
  },
  { timestamps: true },
);

const Vaccination = mongoose.model("Vaccination", vaccinationSchema);
module.exports = Vaccination;
