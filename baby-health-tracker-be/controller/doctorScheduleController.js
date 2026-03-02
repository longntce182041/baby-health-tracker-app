const doctorScheduleService = require('../services/doctorScheduleService');
const doctorService = require('../services/doctorService');

const registerWeeklySchedule = async (req, res) => {
    const doctorId = req.user ? req.user.doctor_id : null;
    const { week_start, days } = req.body;

    try {
        if (!doctorId) {
            return res.status(403).json({ message: 'Doctor id missing in token' });
        }

        if (!Array.isArray(days) || days.length === 0) {
            return res.status(400).json({ message: 'days must be a non-empty array' });
        }

        const results = [];

        for (const day of days) {
            if (!day || !day.date || !Array.isArray(day.slots) || day.slots.length === 0) {
                return res.status(400).json({
                    message: 'Each day must include date and a non-empty slots array',
                });
            }

            const scheduleDate = new Date(day.date);
            if (Number.isNaN(scheduleDate.getTime())) {
                return res.status(400).json({ message: 'Invalid date format in days' });
            }
            scheduleDate.setHours(0, 0, 0, 0);

            const sanitizedSlots = day.slots.map((slot) => {
                if (!slot || !slot.start_time || !slot.end_time) {
                    throw new Error('Each slot must include start_time and end_time');
                }

                return {
                    start_time: slot.start_time,
                    end_time: slot.end_time,
                    patient_ids: [],
                };
            });

            const schedule = await doctorScheduleService.upsertScheduleForDate(
                doctorId,
                scheduleDate,
                sanitizedSlots,
                day.note,
                'available',
            );

            results.push(schedule);
        }

        return res.status(200).json({
            message: 'Weekly schedule registered successfully',
            data: {
                week_start,
                schedules: results,
            },
        });
    } catch (error) {
        if (error.message && error.message.includes('Each slot must include')) {
            return res.status(400).json({ message: error.message });
        }

        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getDoctorSchedule = async (req, res) => {
    const { doctor_id } = req.params;
    const { from_date, to_date } = req.query;
    const parentId = req.user ? req.user.parent_id : null;

    try {
        if (!parentId) {
            return res.status(403).json({ message: 'Parent role required' });
        }

        if (!doctor_id) {
            return res.status(400).json({ message: 'doctor_id is required' });
        }

        const doctor = await doctorService.findDoctorById(doctor_id);
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        let schedules;
        if (from_date && to_date) {
            schedules = await doctorScheduleService.findDoctorSchedules(doctor_id, from_date, to_date);
        } else {
            // Default: get next 30 days
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const thirtyDaysLater = new Date(today);
            thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);

            schedules = await doctorScheduleService.findDoctorSchedules(
                doctor_id,
                today.toISOString(),
                thirtyDaysLater.toISOString()
            );
        }

        // Consolidate schedules into a single structure
        const consolidatedSchedules = schedules.map((schedule) => ({
            date: schedule.date,
            status: schedule.status,
            note: schedule.note || '',
            slots: schedule.slots.map((slot) => ({
                start_time: slot.start_time,
                end_time: slot.end_time,
                booked_count: slot.patient_ids ? slot.patient_ids.length : 0,
                available_slots: 3 - (slot.patient_ids ? slot.patient_ids.length : 0),
                is_fully_booked: slot.patient_ids && slot.patient_ids.length >= 3,
                is_user_booked: slot.patient_ids && slot.patient_ids.some((id) => id.toString() === parentId.toString()),
            })),
        }));

        return res.status(200).json({
            message: 'Doctor schedule fetched',
            doctor: {
                _id: doctor._id,
                full_name: doctor.full_name,
                specialty: doctor.specialty,
            },
            data: consolidatedSchedules,
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    registerWeeklySchedule,
    getDoctorSchedule,
};

