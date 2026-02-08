const accountsService = require('../services/accountsService');

async function create(req, res) {
    try {
        const item = await accountsService.create(req.body);
        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create account', error: error.message });
    }
}

async function getAll(req, res) {
    try {
        const items = await accountsService.getAll(req.query || {});
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch accounts', error: error.message });
    }
}

async function getById(req, res) {
    try {
        const item = await accountsService.getById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Account not found' });
        }
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch account', error: error.message });
    }
}

async function updateById(req, res) {
    try {
        const item = await accountsService.updateById(req.params.id, req.body);
        if (!item) {
            return res.status(404).json({ message: 'Account not found' });
        }
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update account', error: error.message });
    }
}

async function deleteById(req, res) {
    try {
        const item = await accountsService.deleteById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Account not found' });
        }
        res.json({ message: 'Account deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete account', error: error.message });
    }
}

module.exports = {
    create,
    getAll,
    getById,
    updateById,
    deleteById
};
