const Consultation = require('../models/consultations');

const createConsultation = async (consultationData) => {
    const consultation = new Consultation(consultationData);
    return await consultation.save();
};

const syncDoctorConsultationStatuses = async (doctorId) => {
    const now = new Date();

    await Consultation.updateMany(
        {
            doctor_id: doctorId,
            status: 'waiting',
            consultation_time: { $lte: now },
        },
        {
            $set: { status: 'in_progress' },
        }
    );
};

const listConsultations = async (filter = {}) => {
    return await Consultation.find(filter)
        .sort({ consultation_time: -1, createdAt: -1 })
        .populate('doctor_id')
        .populate('baby_id')
        .populate('parent_id')
        .populate('schedule_id');
};

const findConsultationById = async (consultationId) => {
    return await Consultation.findById(consultationId)
        .populate('doctor_id')
        .populate('baby_id')
        .populate('parent_id')
        .populate('schedule_id');
};

const updateConsultationById = async (consultationId, updateData) => {
    return await Consultation.findByIdAndUpdate(
        consultationId,
        updateData,
        { new: true }
    )
        .populate('doctor_id')
        .populate('baby_id')
        .populate('parent_id')
        .populate('schedule_id');
};

const getConsultationStatusSummary = async () => {
    const grouped = await Consultation.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
            },
        },
    ]);

    const summary = {
        waiting: 0,
        in_progress: 0,
        completed: 0,
        canceled: 0,
        total: 0,
    };

    for (const item of grouped) {
        if (item && item._id && summary[item._id] !== undefined) {
            summary[item._id] = item.count;
            summary.total += item.count;
        }
    }

    return summary;
};

const getUpcomingConsultationsByDoctor = async (doctorId, limit = 10) => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    return await Consultation.find({
        doctor_id: doctorId,
        status: { $in: ['waiting', 'in_progress'] },
        consultation_time: { $gte: startOfToday },
    })
        .sort({ consultation_time: 1, createdAt: 1 })
        .limit(limit)
        .populate('doctor_id')
        .populate('baby_id')
        .populate('parent_id')
        .populate('schedule_id');
};

const getDoctorConsultationStats = async (doctorId) => {
    const now = new Date();

    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(startOfToday);
    endOfToday.setDate(endOfToday.getDate() + 1);

    // Monday as start of week
    const startOfWeek = new Date(startOfToday);
    const day = startOfWeek.getDay();
    const offsetToMonday = (day + 6) % 7;
    startOfWeek.setDate(startOfWeek.getDate() - offsetToMonday);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 7);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const baseFilter = { doctor_id: doctorId };

    const [
        todayTotal,
        todayCompleted,
        weekTotal,
        weekCompleted,
        monthTotal,
        monthCompleted,
        pendingTotal,
    ] = await Promise.all([
        Consultation.countDocuments({
            ...baseFilter,
            consultation_time: { $gte: startOfToday, $lt: endOfToday },
        }),
        Consultation.countDocuments({
            ...baseFilter,
            status: 'completed',
            consultation_time: { $gte: startOfToday, $lt: endOfToday },
        }),
        Consultation.countDocuments({
            ...baseFilter,
            consultation_time: { $gte: startOfWeek, $lt: endOfWeek },
        }),
        Consultation.countDocuments({
            ...baseFilter,
            status: 'completed',
            consultation_time: { $gte: startOfWeek, $lt: endOfWeek },
        }),
        Consultation.countDocuments({
            ...baseFilter,
            consultation_time: { $gte: startOfMonth, $lt: endOfMonth },
        }),
        Consultation.countDocuments({
            ...baseFilter,
            status: 'completed',
            consultation_time: { $gte: startOfMonth, $lt: endOfMonth },
        }),
        Consultation.countDocuments({
            ...baseFilter,
            status: { $in: ['waiting', 'in_progress'] },
            consultation_time: { $gte: now },
        }),
    ]);

    return {
        today: {
            total: todayTotal,
            completed: todayCompleted,
        },
        week: {
            total: weekTotal,
            completed: weekCompleted,
        },
        month: {
            total: monthTotal,
            completed: monthCompleted,
        },
        pending: {
            total: pendingTotal,
        },
    };
};

const getConsultationsByDoctor = async (doctorId, options = {}) => {
    const {
        status,
        fromDate,
        toDate,
        search,
        limit = 100,
    } = options;

    const filter = {
        doctor_id: doctorId,
    };

    if (status && status !== 'all') {
        filter.status = status;
    }

    if (fromDate || toDate) {
        filter.consultation_time = {};

        if (fromDate) {
            const start = new Date(`${fromDate}T00:00:00.000Z`);
            if (!Number.isNaN(start.getTime())) {
                filter.consultation_time.$gte = start;
            }
        }

        if (toDate) {
            const end = new Date(`${toDate}T23:59:59.999Z`);
            if (!Number.isNaN(end.getTime())) {
                filter.consultation_time.$lte = end;
            }
        }

        if (Object.keys(filter.consultation_time).length === 0) {
            delete filter.consultation_time;
        }
    }

    const safeLimit = Number.isFinite(Number(limit))
        ? Math.min(Math.max(Number(limit), 1), 200)
        : 100;

    const consultations = await Consultation.find(filter)
        .sort({ consultation_time: -1, createdAt: -1 })
        .limit(safeLimit)
        .populate('doctor_id')
        .populate('baby_id')
        .populate('parent_id')
        .populate('schedule_id');

    const keyword = search ? String(search).trim().toLowerCase() : '';
    if (!keyword) {
        return consultations;
    }

    return consultations.filter((item) => {
        const babyName = item?.baby_id?.full_name || '';
        const parentName = item?.parent_id?.full_name || '';
        const notes = item?.notes || '';
        const content = `${babyName} ${parentName} ${notes}`.toLowerCase();
        return content.includes(keyword);
    });
};

const endConsultationByDoctor = async (consultationId, doctorId) => {
    const consultation = await Consultation.findOne({
        _id: consultationId,
        doctor_id: doctorId,
    });

    if (!consultation) {
        return null;
    }

    if (consultation.status !== 'in_progress') {
        return {
            invalidStatus: true,
            consultation,
        };
    }

    consultation.status = 'completed';
    await consultation.save();

    return await Consultation.findById(consultation._id)
        .populate('doctor_id')
        .populate('baby_id')
        .populate('parent_id')
        .populate('schedule_id');
};

module.exports = {
    createConsultation,
    syncDoctorConsultationStatuses,
    listConsultations,
    findConsultationById,
    updateConsultationById,
    getConsultationStatusSummary,
    getUpcomingConsultationsByDoctor,
    getDoctorConsultationStats,
    getConsultationsByDoctor,
    endConsultationByDoctor,
};
