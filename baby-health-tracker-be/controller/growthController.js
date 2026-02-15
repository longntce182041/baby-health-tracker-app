const babyService = require('../services/babyService');
const growthService = require('../services/growthService');

const addGrowthRecord = async (req, res) => {
    const { baby_id, head_size, weight, height, record_date } = req.body;
    const parentId = req.user ? req.user.parent_id : null;

    try {
        if (!baby_id || head_size === undefined || weight === undefined || height === undefined || !record_date) {
            return res.status(400).json({
                message: 'baby_id, head_size, weight, height, and record_date are required',
            });
        }

        if (!parentId) {
            return res.status(403).json({ message: 'Parent role required' });
        }

        const baby = await babyService.findBabyById(baby_id);
        if (!baby || !baby.status) {
            return res.status(404).json({ message: 'Baby not found' });
        }

        const isOwner = Array.isArray(baby.parent_ids)
            && baby.parent_ids.some((id) => id.toString() === parentId.toString());
        if (!isOwner) {
            return res.status(403).json({ message: 'Not allowed to add growth record for this baby' });
        }

        const record = await growthService.createGrowthRecord({
            baby_id,
            head_size,
            weight,
            height,
            record_date,
        });

        res.status(201).json({ message: 'Growth record created', data: record });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    addGrowthRecord,
};
