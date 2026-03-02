const vaccinationService = require('../services/vaccinationService');

const addVaccine = async (req, res) => {
    const { vaccine_name, dose_number, price, location } = req.body;

    try {
        if (!vaccine_name || dose_number === undefined || price === undefined) {
            return res.status(400).json({
                message: 'vaccine_name, dose_number, and price are required',
            });
        }

        if (!Array.isArray(location) || location.length === 0) {
            return res.status(400).json({
                message: 'location must be a non-empty array of branch_name and address',
            });
        }

        for (const item of location) {
            if (!item || !item.branch_name || !item.address) {
                return res.status(400).json({
                    message: 'Each location must include branch_name and address',
                });
            }
        }

        const created = await vaccinationService.createVaccination({
            vaccine_name,
            dose_number,
            price,
            location,
        });

        return res.status(201).json({ message: 'Vaccination created', data: created });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const updateVaccineLocations = async (req, res) => {
    const { id } = req.params;
    const { add, remove_ids } = req.body;

    try {
        const vaccination = await vaccinationService.findVaccinationById(id);
        if (!vaccination) {
            return res.status(404).json({ message: 'Vaccination not found' });
        }

        if ((!Array.isArray(add) || add.length === 0) && (!Array.isArray(remove_ids) || remove_ids.length === 0)) {
            return res.status(400).json({ message: 'add or remove_ids must be provided' });
        }

        if (Array.isArray(add)) {
            for (const item of add) {
                if (!item || !item.branch_name || !item.address) {
                    return res.status(400).json({
                        message: 'Each added location must include branch_name and address',
                    });
                }
            }
        }

        let updated = vaccination;
        if (Array.isArray(add) && add.length > 0) {
            updated = await vaccinationService.addLocations(id, add);
        }

        if (Array.isArray(remove_ids) && remove_ids.length > 0) {
            updated = await vaccinationService.removeLocationsByIds(id, remove_ids);
        }

        return res.status(200).json({ message: 'Vaccination locations updated', data: updated });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    addVaccine,
    updateVaccineLocations,
};
