const babyService = require('../services/babyService');
const vaccinationService = require('../services/vaccinationService');
const vaccinationScheduleService = require('../services/vaccinationScheduleService');
const notificationService = require('../services/notificationService');

const bookVaccinationAppointment = async (req, res) => {
    const { baby_id, vaccine_id, injection_date, location, notes } = req.body;
    const parentId = req.user ? req.user.parent_id : null;

    try {
        if (!baby_id || !vaccine_id || !injection_date || !location) {
            return res.status(400).json({
                message: 'baby_id, vaccine_id, injection_date, and location are required',
            });
        }

        if (!parentId) {
            return res.status(403).json({ message: 'Parent role required' });
        }

        if (!location.branch_name || !location.address) {
            return res.status(400).json({ message: 'location must include branch_name and address' });
        }

        const baby = await babyService.findBabyById(baby_id);
        if (!baby || !baby.status) {
            return res.status(404).json({ message: 'Baby not found' });
        }

        const isOwner = Array.isArray(baby.parent_ids)
            && baby.parent_ids.some((id) => id.toString() === parentId.toString());
        if (!isOwner) {
            return res.status(403).json({ message: 'Not allowed to book for this baby' });
        }

        const vaccine = await vaccinationService.findVaccinationById(vaccine_id);
        if (!vaccine) {
            return res.status(404).json({ message: 'Vaccine not found' });
        }

        const appointmentDate = new Date(injection_date);
        if (Number.isNaN(appointmentDate.getTime())) {
            return res.status(400).json({ message: 'Invalid injection_date format' });
        }

        const normalizedNotes = Array.isArray(notes)
            ? notes.filter((item) => item && typeof item.content === 'string')
            : [];

        const schedule = await vaccinationScheduleService.createSchedule({
            baby_id,
            vaccine_id,
            injection_date: appointmentDate,
            location,
            notes: normalizedNotes,
            status: 'scheduled',
        });

        await notificationService.createReminder(
            parentId,
            `Vaccination scheduled on ${appointmentDate.toISOString()} for vaccine ${vaccine.vaccine_name}.`
        );

        return res.status(201).json({ message: 'Vaccination appointment booked', data: schedule });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const viewVaccinationSchedule = async (req, res) => {
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
            return res.status(403).json({ message: 'Not allowed to view this baby schedule' });
        }

        const schedules = await vaccinationScheduleService.listSchedulesByBabyId(baby_id);
        return res.status(200).json({ message: 'Vaccination schedule fetched', data: schedules });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const viewVaccinationRecordDetails = async (req, res) => {
    const { id } = req.params;
    const parentId = req.user ? req.user.parent_id : null;

    try {
        if (!parentId) {
            return res.status(403).json({ message: 'Parent role required' });
        }

        const schedule = await vaccinationScheduleService.findScheduleById(id);
        if (!schedule) {
            return res.status(404).json({ message: 'Vaccination record not found' });
        }

        const baby = await babyService.findBabyById(schedule.baby_id);
        if (!baby || !baby.status) {
            return res.status(404).json({ message: 'Baby not found' });
        }

        const isOwner = Array.isArray(baby.parent_ids)
            && baby.parent_ids.some((parent) => parent.toString() === parentId.toString());
        if (!isOwner) {
            return res.status(403).json({ message: 'Not allowed to view this record' });
        }

        return res.status(200).json({ message: 'Vaccination record fetched', data: schedule });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const updateVaccinationRecord = async (req, res) => {
    const { id } = req.params;
    const { injection_date, location, status, notes } = req.body;
    const parentId = req.user ? req.user.parent_id : null;

    try {
        if (!parentId) {
            return res.status(403).json({ message: 'Parent role required' });
        }

        const schedule = await vaccinationScheduleService.findScheduleById(id);
        if (!schedule) {
            return res.status(404).json({ message: 'Vaccination record not found' });
        }

        const baby = await babyService.findBabyById(schedule.baby_id);
        if (!baby || !baby.status) {
            return res.status(404).json({ message: 'Baby not found' });
        }

        const isOwner = Array.isArray(baby.parent_ids)
            && baby.parent_ids.some((parent) => parent.toString() === parentId.toString());
        if (!isOwner) {
            return res.status(403).json({ message: 'Not allowed to update this record' });
        }

        const updateData = {};
        if (injection_date !== undefined) {
            const parsedDate = new Date(injection_date);
            if (Number.isNaN(parsedDate.getTime())) {
                return res.status(400).json({ message: 'Invalid injection_date format' });
            }
            updateData.injection_date = parsedDate;
        }

        if (location !== undefined) {
            if (!location || !location.branch_name || !location.address) {
                return res.status(400).json({ message: 'location must include branch_name and address' });
            }
            updateData.location = location;
        }

        if (status !== undefined) {
            updateData.status = status;
        }

        if (Array.isArray(notes)) {
            updateData.notes = notes.filter((item) => item && typeof item.content === 'string');
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: 'No update fields provided' });
        }

        const updated = await vaccinationScheduleService.updateScheduleById(id, updateData);
        return res.status(200).json({ message: 'Vaccination record updated', data: updated });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const markVaccinationCompleted = async (req, res) => {
    const { id } = req.params;
    const parentId = req.user ? req.user.parent_id : null;

    try {
        if (!parentId) {
            return res.status(403).json({ message: 'Parent role required' });
        }

        const schedule = await vaccinationScheduleService.findScheduleById(id);
        if (!schedule) {
            return res.status(404).json({ message: 'Vaccination record not found' });
        }

        const baby = await babyService.findBabyById(schedule.baby_id);
        if (!baby || !baby.status) {
            return res.status(404).json({ message: 'Baby not found' });
        }

        const isOwner = Array.isArray(baby.parent_ids)
            && baby.parent_ids.some((parent) => parent.toString() === parentId.toString());
        if (!isOwner) {
            return res.status(403).json({ message: 'Not allowed to update this record' });
        }

        const updated = await vaccinationScheduleService.updateScheduleById(id, { status: 'completed' });
        return res.status(200).json({ message: 'Vaccination marked as completed', data: updated });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const viewVaccinationNotesList = async (req, res) => {
    const { id } = req.params;
    const parentId = req.user ? req.user.parent_id : null;

    try {
        if (!parentId) {
            return res.status(403).json({ message: 'Parent role required' });
        }

        const schedule = await vaccinationScheduleService.findScheduleById(id);
        if (!schedule) {
            return res.status(404).json({ message: 'Vaccination record not found' });
        }

        const baby = await babyService.findBabyById(schedule.baby_id);
        if (!baby || !baby.status) {
            return res.status(404).json({ message: 'Baby not found' });
        }

        const isOwner = Array.isArray(baby.parent_ids)
            && baby.parent_ids.some((parent) => parent.toString() === parentId.toString());
        if (!isOwner) {
            return res.status(403).json({ message: 'Not allowed to view notes' });
        }

        return res.status(200).json({ message: 'Vaccination notes fetched', data: schedule.notes || [] });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const viewVaccineList = async (req, res) => {
    try {
        const vaccines = await vaccinationService.listVaccinations();
        return res.status(200).json({ message: 'Vaccine list fetched', data: vaccines });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const viewVaccinationClinicsByVaccine = async (req, res) => {
    const { id } = req.params;

    try {
        const vaccine = await vaccinationService.findVaccinationById(id);
        if (!vaccine) {
            return res.status(404).json({ message: 'Vaccine not found' });
        }

        return res.status(200).json({ message: 'Vaccination clinics fetched', data: vaccine.location || [] });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    bookVaccinationAppointment,
    viewVaccinationSchedule,
    viewVaccinationRecordDetails,
    updateVaccinationRecord,
    markVaccinationCompleted,
    viewVaccinationNotesList,
    viewVaccineList,
    viewVaccinationClinicsByVaccine,
};
