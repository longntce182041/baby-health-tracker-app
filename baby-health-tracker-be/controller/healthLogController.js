const babyService = require('../services/babyService');
const healthLogService = require('../services/healthLogService');

const createHealthLog = async (req, res) => {
    const {
        baby_id,
        log_date,
        tempurature,
        sleep,
        image_urls,
        symptoms,
        activities,
        eating,
        mood,
        notes,
    } = req.body;
    const parentId = req.user ? req.user.parent_id : null;

    try {
        if (!baby_id || !log_date || tempurature === undefined || sleep === undefined) {
            return res.status(400).json({
                message: 'baby_id, log_date, tempurature, and sleep are required',
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
            return res.status(403).json({ message: 'Not allowed to add health diary for this baby' });
        }

        const log = await healthLogService.createHealthLog({
            baby_id,
            log_date,
            tempurature,
            sleep,
            image_urls,
            symptoms,
            activities,
            eating,
            mood,
            notes,
        });

        res.status(201).json({ message: 'Health diary created', data: log });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const listHealthLogs = async (req, res) => {
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
            return res.status(403).json({ message: 'Not allowed to view health diary for this baby' });
        }

        const logs = await healthLogService.listHealthLogsByBabyId(baby_id);
        res.status(200).json({ message: 'Health diary list fetched', data: logs });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const updateHealthLog = async (req, res) => {
    const { id } = req.params;
    const {
        log_date,
        tempurature,
        sleep,
        image_urls,
        symptoms,
        activities,
        eating,
        mood,
        notes,
    } = req.body;
    const parentId = req.user ? req.user.parent_id : null;

    try {
        if (!parentId) {
            return res.status(403).json({ message: 'Parent role required' });
        }

        const existingLog = await healthLogService.findHealthLogById(id);
        if (!existingLog) {
            return res.status(404).json({ message: 'Health diary not found' });
        }

        const baby = await babyService.findBabyById(existingLog.baby_id);
        if (!baby || !baby.status) {
            return res.status(404).json({ message: 'Baby not found' });
        }

        const isOwner = Array.isArray(baby.parent_ids)
            && baby.parent_ids.some((parent) => parent.toString() === parentId.toString());
        if (!isOwner) {
            return res.status(403).json({ message: 'Not allowed to update health diary for this baby' });
        }

        const updateData = {};
        if (log_date !== undefined) updateData.log_date = log_date;
        if (tempurature !== undefined) updateData.tempurature = tempurature;
        if (sleep !== undefined) updateData.sleep = sleep;
        if (image_urls !== undefined) updateData.image_urls = image_urls;
        if (symptoms !== undefined) updateData.symptoms = symptoms;
        if (activities !== undefined) updateData.activities = activities;
        if (eating !== undefined) updateData.eating = eating;
        if (mood !== undefined) updateData.mood = mood;
        if (notes !== undefined) updateData.notes = notes;

        const updated = await healthLogService.updateHealthLogById(id, updateData);
        res.status(200).json({ message: 'Health diary updated', data: updated });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const deleteHealthLog = async (req, res) => {
    const { id } = req.params;
    const parentId = req.user ? req.user.parent_id : null;

    try {
        if (!parentId) {
            return res.status(403).json({ message: 'Parent role required' });
        }

        const existingLog = await healthLogService.findHealthLogById(id);
        if (!existingLog) {
            return res.status(404).json({ message: 'Health diary not found' });
        }

        const baby = await babyService.findBabyById(existingLog.baby_id);
        if (!baby || !baby.status) {
            return res.status(404).json({ message: 'Baby not found' });
        }

        const isOwner = Array.isArray(baby.parent_ids)
            && baby.parent_ids.some((parent) => parent.toString() === parentId.toString());
        if (!isOwner) {
            return res.status(403).json({ message: 'Not allowed to delete health diary for this baby' });
        }

        await healthLogService.deleteHealthLogById(id);
        res.status(200).json({ message: 'Health diary deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    createHealthLog,
    listHealthLogs,
    updateHealthLog,
    deleteHealthLog,
};
