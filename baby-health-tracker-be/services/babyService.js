const crypto = require('crypto');

const Baby = require('../models/babies');

const generateUniqueCode = async () => {
    for (let attempt = 0; attempt < 5; attempt += 1) {
        const code = crypto.randomBytes(4).toString('hex').toUpperCase();
        const exists = await Baby.findOne({ code });
        if (!exists) {
            return code;
        }
    }

    throw new Error('Unable to generate unique baby code');
};

const createBaby = async (babyData) => {
    const code = babyData.code || (await generateUniqueCode());
    const baby = new Baby({
        ...babyData,
        code,
    });
    return await baby.save();
};

const updateBabyById = async (babyId, updateData) => {
    return await Baby.findByIdAndUpdate(babyId, updateData, { new: true });
};

const deleteBabyById = async (babyId) => {
    return await Baby.findByIdAndUpdate(babyId, { status: false }, { new: true });
};

const listBabies = async (parentId) => {
    const filter = { status: true };
    if (parentId) {
        filter.parent_ids = parentId;
    }
    return await Baby.find(filter).sort({ day_of_birth: 1 });
};

const findBabyByCode = async (code) => {
    return await Baby.findOne({ code, status: true });
};

const findBabyById = async (babyId) => {
    return await Baby.findById(babyId);
};

const addParentToBabyByCode = async (code, parentId) => {
    return await Baby.findOneAndUpdate(
        { code, status: true },
        { $addToSet: { parent_ids: parentId } },
        { new: true }
    );
};

const addNoteToBabyById = async (babyId, noteData) => {
    return await Baby.findOneAndUpdate(
        { _id: babyId, status: true },
        { $push: { note: noteData } },
        { new: true }
    );
};

module.exports = {
    createBaby,
    updateBabyById,
    deleteBabyById,
    listBabies,
    findBabyByCode,
    addParentToBabyByCode,
    findBabyById,
    addNoteToBabyById,
};
