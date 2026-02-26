const babyService = require('../services/babyService');

const normalizeNoteInput = (note) => {
    if (note === undefined) {
        return undefined;
    }

    if (typeof note === 'string') {
        return [{ content: note }];
    }

    if (Array.isArray(note)) {
        const normalizedNotes = [];

        for (const item of note) {
            if (typeof item === 'string') {
                normalizedNotes.push({ content: item });
                continue;
            }

            if (item && typeof item === 'object' && typeof item.content === 'string') {
                const normalizedItem = { content: item.content };
                if (item.created_at) {
                    normalizedItem.created_at = item.created_at;
                }
                normalizedNotes.push(normalizedItem);
                continue;
            }

            return null;
        }

        return normalizedNotes;
    }

    if (note && typeof note === 'object' && typeof note.content === 'string') {
        const normalizedItem = { content: note.content };
        if (note.created_at) {
            normalizedItem.created_at = note.created_at;
        }
        return [normalizedItem];
    }

    return null;
};

const addBaby = async (req, res) => {
    const { full_name, avatar_url, day_of_birth, gender, note } = req.body;
    const parentId = req.user ? req.user.parent_id : null;

    try {
        if (!parentId) {
            return res.status(403).json({ message: 'Parent role required' });
        }

        if (!full_name || !day_of_birth || !gender) {
            return res.status(400).json({
                message: 'full_name, day_of_birth, and gender are required',
            });
        }

        const normalizedNote = normalizeNoteInput(note);
        if (note !== undefined && normalizedNote === null) {
            return res.status(400).json({
                message: 'note must be a string, object { content }, or an array of these',
            });
        }

        const baby = await babyService.createBaby({
            parent_ids: [parentId],
            full_name,
            avatar_url,
            day_of_birth,
            gender,
            note: normalizedNote,
            status: true,
        });

        res.status(201).json({ message: 'Baby created successfully', data: baby });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const updateBaby = async (req, res) => {
    const { id } = req.params;
    const { full_name, avatar_url, day_of_birth, gender, note } = req.body;

    try {
        const updateData = {};
        if (full_name !== undefined) updateData.full_name = full_name;
        if (avatar_url !== undefined) updateData.avatar_url = avatar_url;
        if (day_of_birth !== undefined) updateData.day_of_birth = day_of_birth;
        if (gender !== undefined) updateData.gender = gender;
        if (note !== undefined) {
            const normalizedNote = normalizeNoteInput(note);
            if (normalizedNote === null) {
                return res.status(400).json({
                    message: 'note must be a string, object { content }, or an array of these',
                });
            }
            updateData.note = normalizedNote;
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                message: 'At least one of full_name, avatar_url, day_of_birth, gender, note is required',
            });
        }

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

const getBabyDetail = async (req, res) => {
    const { id } = req.params;
    const parentId = req.user ? req.user.parent_id : null;

    try {
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
            return res.status(403).json({ message: 'Not allowed to view this baby' });
        }

        res.status(200).json({ message: 'Baby detail fetched', data: baby });
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
    const { content, note, created_at } = req.body;
    const parentId = req.user ? req.user.parent_id : null;

    try {
        const resolvedContent = content !== undefined ? content : note;
        if (!resolvedContent || typeof resolvedContent !== 'string') {
            return res.status(400).json({ message: 'content (or note) is required' });
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

        const noteData = { content: resolvedContent };
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
    getBabyDetail,
    getBabyByCode,
    shareBabyToParent,
    addBabyNote,
};
