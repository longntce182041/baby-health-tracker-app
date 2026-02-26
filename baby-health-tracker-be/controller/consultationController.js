const babyService = require('../services/babyService');
const doctorService = require('../services/doctorService');
const doctorScheduleService = require('../services/doctorScheduleService');
const consultationService = require('../services/consultationService');

const scheduleConsultation = async (req, res) => {
    const { doctor_id, baby_id, date, start_time, end_time, notes } = req.body;
    const parentId = req.user ? req.user.parent_id : null;

    try {
        if (!doctor_id || !baby_id || !date || !start_time || !end_time) {
            return res.status(400).json({
                message: 'doctor_id, baby_id, date, start_time, and end_time are required',
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
            return res.status(403).json({ message: 'Not allowed to schedule consultation for this baby' });
        }

        const doctor = await doctorService.findDoctorById(doctor_id);
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        const scheduleDate = new Date(date);
        if (Number.isNaN(scheduleDate.getTime())) {
            return res.status(400).json({ message: 'Invalid date format' });
        }
        scheduleDate.setHours(0, 0, 0, 0);

        const schedule = await doctorScheduleService.findScheduleByDoctorAndDate(doctor_id, scheduleDate);
        if (!schedule || schedule.status !== 'available') {
            return res.status(400).json({ message: 'Doctor is not available on this date' });
        }

        const slotIndex = schedule.slots.findIndex(
            (slot) => slot.start_time === start_time && slot.end_time === end_time,
        );

        if (slotIndex === -1) {
            return res.status(404).json({ message: 'Time slot not found for this date' });
        }

        if (schedule.slots[slotIndex].is_booked) {
            return res.status(400).json({ message: 'Time slot is already booked' });
        }

        schedule.slots[slotIndex].is_booked = true;
        schedule.slots[slotIndex].patient_id = parentId;
        await schedule.save();

        const consultationTime = new Date(scheduleDate);
        const [hourStr, minuteStr] = start_time.split(':');
        if (!hourStr || !minuteStr) {
            return res.status(400).json({ message: 'start_time must be in HH:MM format' });
        }
        consultationTime.setHours(Number(hourStr), Number(minuteStr), 0, 0);

        const consultation = await consultationService.createConsultation({
            parent_id: parentId,
            baby_id,
            doctor_id,
            schedule_id: schedule._id,
            status: 'scheduled',
            consultation_time: consultationTime,
            notes,
        });

        return res.status(201).json({ message: 'Consultation scheduled successfully', data: consultation });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const listConsultationDoctors = async (req, res) => {
    const parentId = req.user ? req.user.parent_id : null;

    try {
        if (!parentId) {
            return res.status(403).json({ message: 'Parent role required' });
        }

        const schedules = await doctorScheduleService.findAvailableSchedules();

        const doctorMap = new Map();
        for (const schedule of schedules) {
            const doctor = schedule.doctor_id;
            if (!doctor) continue;

            const key = doctor._id.toString();
            if (!doctorMap.has(key)) {
                doctorMap.set(key, {
                    _id: doctor._id,
                    full_name: doctor.full_name,
                    avatar_url: doctor.avatar_url,
                    specialty: doctor.specialty,
                });
            }
        }

        const doctors = Array.from(doctorMap.values());

        return res.status(200).json({
            message: 'Consultation doctor list fetched',
            data: doctors,
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    scheduleConsultation,
    listConsultationDoctors,
};
