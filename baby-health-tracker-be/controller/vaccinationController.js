const vaccinationService = require('../services/vaccinationService');
const hospitalBranchService = require('../services/hospitalBranchService');

const validateLocationIds = async (locationIds) => {
    if (!Array.isArray(locationIds) || locationIds.length === 0) {
        return { ok: false, message: 'location_ids must be a non-empty array of branch IDs' };
    }

    const uniqueIds = [...new Set(locationIds.map((id) => id.toString()))];
    const branches = await hospitalBranchService.findBranchesByIds(uniqueIds);
    if (branches.length !== uniqueIds.length) {
        return { ok: false, message: 'One or more branch IDs are invalid' };
    }

    return { ok: true };
};

const addVaccine = async (req, res) => {
    const { vaccine_name, dose_number, price, location_ids } = req.body;

    try {
        if (!vaccine_name || dose_number === undefined || price === undefined) {
            return res.status(400).json({
                message: 'vaccine_name, dose_number, and price are required',
            });
        }

        const locationValidation = await validateLocationIds(location_ids);
        if (!locationValidation.ok) {
            return res.status(400).json({
                message: locationValidation.message,
            });
        }

        const created = await vaccinationService.createVaccination({
            vaccine_name,
            dose_number,
            price,
            location: location_ids,
        });

        const populated = await vaccinationService.findVaccinationById(created._id);
        return res.status(201).json({ message: 'Vaccination created', data: populated });
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

        if (Array.isArray(add) && add.length > 0) {
            const addValidation = await validateLocationIds(add);
            if (!addValidation.ok) {
                return res.status(400).json({ message: addValidation.message });
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

const adminListVaccines = async (req, res) => {
    try {
        const vaccines = await vaccinationService.listVaccinations();
        return res.status(200).json({ message: 'Vaccine list fetched', data: vaccines });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const adminAddVaccine = async (req, res) => {
    return addVaccine(req, res);
};

const adminUpdateVaccine = async (req, res) => {
    const { id } = req.params;
    const { vaccine_name, dose_number, price, location_ids } = req.body;

    try {
        const vaccine = await vaccinationService.findVaccinationById(id);
        if (!vaccine) {
            return res.status(404).json({ message: 'Vaccine not found' });
        }

        const updateData = {};
        if (vaccine_name !== undefined) updateData.vaccine_name = vaccine_name;
        if (dose_number !== undefined) updateData.dose_number = dose_number;
        if (price !== undefined) updateData.price = price;

        if (location_ids !== undefined) {
            const locationValidation = await validateLocationIds(location_ids);
            if (!locationValidation.ok) {
                return res.status(400).json({ message: locationValidation.message });
            }

            updateData.location = location_ids;
        }

        const updated = await vaccinationService.updateVaccinationById(id, updateData);
        return res.status(200).json({ message: 'Vaccine updated successfully', data: updated });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const adminDeleteVaccine = async (req, res) => {
    const { id } = req.params;

    try {
        const vaccine = await vaccinationService.findVaccinationById(id);
        if (!vaccine) {
            return res.status(404).json({ message: 'Vaccine not found' });
        }

        await vaccinationService.deleteVaccinationById(id);
        return res.status(200).json({ message: 'Vaccine deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    addVaccine,
    updateVaccineLocations,
    adminListVaccines,
    adminAddVaccine,
    adminUpdateVaccine,
    adminDeleteVaccine,
};
