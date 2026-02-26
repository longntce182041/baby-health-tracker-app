const GrowthRecord = require('../models/growth_records');

const GROWTH_STANDARDS_BY_GENDER = {
    male: [
        { max_months: 0, weight: { min: 2.5, max: 4.4 }, height: { min: 46.1, max: 53.7 } },
        { max_months: 3, weight: { min: 4.5, max: 7.9 }, height: { min: 55.3, max: 64.5 } },
        { max_months: 6, weight: { min: 6.4, max: 9.8 }, height: { min: 63.3, max: 71.9 } },
        { max_months: 9, weight: { min: 7.4, max: 11.3 }, height: { min: 67.7, max: 76.2 } },
        { max_months: 12, weight: { min: 8.4, max: 12.0 }, height: { min: 71.0, max: 80.0 } },
        { max_months: 18, weight: { min: 9.2, max: 13.8 }, height: { min: 76.9, max: 86.7 } },
        { max_months: 24, weight: { min: 10.0, max: 15.2 }, height: { min: 81.7, max: 91.0 } },
    ],
    female: [
        { max_months: 0, weight: { min: 2.4, max: 4.2 }, height: { min: 45.4, max: 52.9 } },
        { max_months: 3, weight: { min: 4.2, max: 7.4 }, height: { min: 54.2, max: 63.3 } },
        { max_months: 6, weight: { min: 5.8, max: 9.2 }, height: { min: 61.2, max: 70.3 } },
        { max_months: 9, weight: { min: 6.8, max: 10.7 }, height: { min: 65.3, max: 74.9 } },
        { max_months: 12, weight: { min: 7.6, max: 11.5 }, height: { min: 69.2, max: 78.9 } },
        { max_months: 18, weight: { min: 8.6, max: 13.2 }, height: { min: 74.9, max: 85.4 } },
        { max_months: 24, weight: { min: 9.2, max: 14.8 }, height: { min: 80.0, max: 90.5 } },
    ],
};

const getAgeInMonths = (dayOfBirth, atDate) => {
    const dob = new Date(dayOfBirth);
    const date = new Date(atDate);

    if (Number.isNaN(dob.getTime()) || Number.isNaN(date.getTime())) {
        return null;
    }

    let months = (date.getFullYear() - dob.getFullYear()) * 12;
    months += date.getMonth() - dob.getMonth();
    if (date.getDate() < dob.getDate()) {
        months -= 1;
    }

    return months < 0 ? 0 : months;
};

const getStandardRange = (gender, ageInMonths) => {
    const standards = GROWTH_STANDARDS_BY_GENDER[gender] || GROWTH_STANDARDS_BY_GENDER.male;
    const matched = standards.find((item) => ageInMonths <= item.max_months);
    return matched || standards[standards.length - 1];
};

const getMetricStatus = (value, range) => {
    if (value < range.min) {
        return {
            status: 'below',
            delta: Number((value - range.min).toFixed(2)),
        };
    }

    if (value > range.max) {
        return {
            status: 'above',
            delta: Number((value - range.max).toFixed(2)),
        };
    }

    return {
        status: 'normal',
        delta: 0,
    };
};

const createGrowthRecord = async (recordData) => {
    const record = new GrowthRecord(recordData);
    return await record.save();
};

const listGrowthRecordsByBabyId = async (babyId) => {
    return await GrowthRecord.find({ baby_id: babyId }).sort({ record_date: 1 });
};

const findGrowthRecordById = async (recordId) => {
    return await GrowthRecord.findById(recordId);
};

const getLatestGrowthRecordByBabyId = async (babyId) => {
    return await GrowthRecord.findOne({ baby_id: babyId }).sort({ record_date: -1 });
};

const compareGrowthWithStandard = (baby, growthRecord) => {
    const ageInMonths = getAgeInMonths(baby.day_of_birth, growthRecord.record_date);
    const standard = getStandardRange(baby.gender, ageInMonths || 0);

    return {
        record: {
            id: growthRecord._id,
            baby_id: growthRecord.baby_id,
            record_date: growthRecord.record_date,
            weight: growthRecord.weight,
            height: growthRecord.height,
            head_size: growthRecord.head_size,
        },
        standard: {
            age_in_months: ageInMonths,
            gender: baby.gender,
            weight: {
                min: standard.weight.min,
                max: standard.weight.max,
                unit: 'kg',
            },
            height: {
                min: standard.height.min,
                max: standard.height.max,
                unit: 'cm',
            },
        },
        comparison: {
            weight: getMetricStatus(growthRecord.weight, standard.weight),
            height: getMetricStatus(growthRecord.height, standard.height),
        },
    };
};

module.exports = {
    createGrowthRecord,
    listGrowthRecordsByBabyId,
    findGrowthRecordById,
    getLatestGrowthRecordByBabyId,
    compareGrowthWithStandard,
};
