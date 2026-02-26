const doctorScheduleService = require('../services/doctorScheduleService');

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
                    is_booked: false,
                    patient_id: null,
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

module.exports = {
    registerWeeklySchedule,
};
