const GrowthRecord = require('../models/growth_records');

const createGrowthRecord = async (recordData) => {
    const record = new GrowthRecord(recordData);
    return await record.save();
};

module.exports = {
    createGrowthRecord,
};
