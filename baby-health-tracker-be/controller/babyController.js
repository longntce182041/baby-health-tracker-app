const babyService = require('../services/babyService');

const addBaby = async (req, res) => {
    const { parent_id, parent_ids, full_name, avatar_url, day_of_birth, gender, note } = req.body;

    try {
        const resolvedParentIds = Array.isArray(parent_ids)
            ? parent_ids
            : parent_id
                ? [parent_id]
                : [];

        if (resolvedParentIds.length === 0 || !full_name || !day_of_birth || !gender) {
            return res.status(400).json({
                message: 'parent_ids, full_name, day_of_birth, and gender are required',
            });
        }

        const baby = await babyService.createBaby({
            parent_ids: resolvedParentIds,
            full_name,
            avatar_url,
            day_of_birth,
            gender,
            note,
            status: true,
        });

        res.status(201).json({ message: 'Baby created successfully', data: baby });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const updateBaby = async (req, res) => {
    const { id } = req.params;
    const { parent_ids, full_name, avatar_url, day_of_birth, gender, note, code, status } = req.body;

    try {
        const updateData = {};
        if (parent_ids !== undefined) updateData.parent_ids = parent_ids;
        if (full_name !== undefined) updateData.full_name = full_name;
        if (avatar_url !== undefined) updateData.avatar_url = avatar_url;
        if (day_of_birth !== undefined) updateData.day_of_birth = day_of_birth;
        if (gender !== undefined) updateData.gender = gender;
        if (note !== undefined) updateData.note = note;
        if (code !== undefined) updateData.code = code;
        if (status !== undefined) updateData.status = status;

        const updated = await babyService.updateBabyById(id, updateData);
        if (!updated) {
            return res.status(404).json({ message: 'Baby not found' });
        }

        res.status(200).json({ message: 'Baby updated successfully', data: updated });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const deleteBaby = async (req, res) => {
    const { id } = req.params;

    try {
        const deleted = await babyService.deleteBabyById(id);
        if (!deleted) {
            return res.status(404).json({ message: 'Baby not found' });
        }

        res.status(200).json({ message: 'Baby deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const listBabies = async (req, res) => {
    const { parent_id } = req.query;

    try {
        const babies = await babyService.listBabies(parent_id);
        res.status(200).json({ message: 'Baby list fetched', data: babies });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getBabyByCode = async (req, res) => {
    const { code } = req.query;

    try {
        if (!code) {
            return res.status(400).json({ message: 'code is required' });
        }

        const baby = await babyService.findBabyByCode(code);
        if (!baby) {
            return res.status(404).json({ message: 'Baby not found' });
        }

        res.status(200).json({ message: 'Baby fetched', data: baby });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const shareBabyToParent = async (req, res) => {
    const { code } = req.body;
    const parent_id = req.user ? req.user.parent_id : null;

    try {
        if (!code || !parent_id) {
            return res.status(400).json({ message: 'code is required' });
        }

        const updated = await babyService.addParentToBabyByCode(code, parent_id);
        if (!updated) {
            return res.status(404).json({ message: 'Baby not found' });
        }

        res.status(200).json({ message: 'Baby shared successfully', data: updated });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const addBabyNote = async (req, res) => {
    const { id } = req.params;
    const { content, created_at } = req.body;
    const parentId = req.user ? req.user.parent_id : null;

    try {
        if (!content) {
            return res.status(400).json({ message: 'content is required' });
        }

        if (!parentId) {
            return res.status(403).json({ message: 'Parent role required' });
        }

        const baby = await babyService.findBabyById(id);
        if (!baby || !baby.status) {
            return res.status(404).json({ message: 'Baby not found' });
        }

        const isOwner = Array.isArray(baby.parent_ids)
            && baby.parent_ids.some((parent) => parent.toString() === parentId.toString());
        if (!isOwner) {
            return res.status(403).json({ message: 'Not allowed to add note for this baby' });
        }

        const noteData = { content };
        if (created_at) {
            noteData.created_at = created_at;
        }

        const updated = await babyService.addNoteToBabyById(id, noteData);
        if (!updated) {
            return res.status(404).json({ message: 'Baby not found' });
        }

        res.status(200).json({ message: 'Baby note added successfully', data: updated });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    addBaby,
    updateBaby,
    deleteBaby,
    listBabies,
    getBabyByCode,
    shareBabyToParent,
    addBabyNote,
};
