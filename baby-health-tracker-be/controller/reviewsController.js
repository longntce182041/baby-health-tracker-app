const reviewsService = require('../services/reviewsService');

async function create(req, res) {
    try {
        const item = await reviewsService.create(req.body);
        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create review', error: error.message });
    }
}

async function getAll(req, res) {
    try {
        const items = await reviewsService.getAll(req.query || {});
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch reviews', error: error.message });
    }
}

async function getById(req, res) {
    try {
        const item = await reviewsService.getById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Review not found' });
        }
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch review', error: error.message });
    }
}

async function updateById(req, res) {
    try {
        const item = await reviewsService.updateById(req.params.id, req.body);
        if (!item) {
            return res.status(404).json({ message: 'Review not found' });
        }
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update review', error: error.message });
    }
}

async function deleteById(req, res) {
    try {
        const item = await reviewsService.deleteById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Review not found' });
        }
        res.json({ message: 'Review deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete review', error: error.message });
    }
}

module.exports = {
    create,
    getAll,
    getById,
    updateById,
    deleteById
};
