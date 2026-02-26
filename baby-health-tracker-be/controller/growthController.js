const babyService = require('../services/babyService');
const growthService = require('../services/growthService');

const addGrowthRecord = async (req, res) => {
    const { baby_id } = req.params;
    const { head_size, weight, height, record_date } = req.body;
    const parentId = req.user ? req.user.parent_id : null;

    try {
        if (!baby_id || head_size === undefined || weight === undefined || height === undefined || !record_date) {
            return res.status(400).json({
                message: 'baby_id param, head_size, weight, height, and record_date are required',
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

const listGrowthChart = async (req, res) => {
    const { baby_id } = req.query;
    const parentId = req.user ? req.user.parent_id : null;

    try {
        if (!baby_id) {
            return res.status(400).json({ message: 'baby_id is required' });
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
            return res.status(403).json({ message: 'Not allowed to view growth chart for this baby' });
        }

        const records = await growthService.listGrowthRecordsByBabyId(baby_id);
        const chartPoints = records.map((record) => ({
            id: record._id,
            record_date: record.record_date,
            head_size: record.head_size,
            weight: record.weight,
            height: record.height,
        }));

        res.status(200).json({
            message: 'Growth chart data fetched',
            data: {
                baby_id,
                points: chartPoints,
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const compareGrowthStandard = async (req, res) => {
    const { baby_id, record_id } = req.query;
    const parentId = req.user ? req.user.parent_id : null;

    try {
        if (!baby_id) {
            return res.status(400).json({ message: 'baby_id is required' });
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
            return res.status(403).json({ message: 'Not allowed to compare growth standard for this baby' });
        }

        let growthRecord;
        if (record_id) {
            growthRecord = await growthService.findGrowthRecordById(record_id);
            if (!growthRecord || growthRecord.baby_id.toString() !== baby_id.toString()) {
                return res.status(404).json({ message: 'Growth record not found' });
            }
        } else {
            growthRecord = await growthService.getLatestGrowthRecordByBabyId(baby_id);
            if (!growthRecord) {
                return res.status(404).json({ message: 'No growth record found for this baby' });
            }
        }

        const compared = growthService.compareGrowthWithStandard(baby, growthRecord);

        res.status(200).json({
            message: 'Growth standard comparison fetched',
            data: compared,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    addGrowthRecord,
    listGrowthChart,
    compareGrowthStandard,
};
