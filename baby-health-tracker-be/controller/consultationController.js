const babyService = require("../services/babyService");
const doctorService = require("../services/doctorService");
const doctorScheduleService = require("../services/doctorScheduleService");
const consultationService = require("../services/consultationService");
const conversationService = require("../services/conversationService");

const scheduleConsultation = async (req, res) => {
  const { doctor_id, baby_id, date, start_time, end_time, notes } = req.body;
  const parentId = req.user ? req.user.parent_id : null;

  try {
    if (!doctor_id || !baby_id || !date || !start_time || !end_time) {
      return res.status(400).json({
        message:
          "doctor_id, baby_id, date, start_time, and end_time are required",
      });
    }

    if (!parentId) {
      return res.status(403).json({ message: "Parent role required" });
    }

    const baby = await babyService.findBabyById(baby_id);
    if (!baby || !baby.status) {
      return res.status(404).json({ message: "Baby not found" });
    }

    const isOwner =
      Array.isArray(baby.parent_ids) &&
      baby.parent_ids.some((id) => id.toString() === parentId.toString());
    if (!isOwner) {
      return res
        .status(403)
        .json({
          message: "Not allowed to schedule consultation for this baby",
        });
    }

    const doctor = await doctorService.findDoctorById(doctor_id);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Parse date in UTC to avoid timezone issues
    // Expecting date format: YYYY-MM-DD
    const scheduleDate = new Date(date + "T00:00:00.000Z");
    if (Number.isNaN(scheduleDate.getTime())) {
      return res
        .status(400)
        .json({ message: "Invalid date format. Expected YYYY-MM-DD" });
    }

    console.log("Looking for schedule with date:", {
      inputDate: date,
      parsedDate: scheduleDate,
      isoString: scheduleDate.toISOString(),
    });

    const schedule = await doctorScheduleService.findScheduleByDoctorAndDate(
      doctor_id,
      scheduleDate,
    );

    console.log(
      "Schedule found:",
      schedule
        ? {
          _id: schedule._id,
          date: schedule.date,
          dateISO: schedule.date.toISOString(),
          status: schedule.status,
          slotsCount: schedule.slots.length,
        }
        : "NO SCHEDULE",
    );

    if (!schedule || schedule.status !== "available") {
      return res
        .status(400)
        .json({ message: "Doctor is not available on this date" });
    }

    const slotIndex = schedule.slots.findIndex(
      (slot) => slot.start_time === start_time && slot.end_time === end_time,
    );

    if (slotIndex === -1) {
      return res
        .status(404)
        .json({ message: "Time slot not found for this date" });
    }

    // Check if slot already has 3 patients booked
    const slot = schedule.slots[slotIndex];
    if (slot.patient_ids && slot.patient_ids.length >= 3) {
      return res
        .status(400)
        .json({
          message: "Time slot is fully booked (maximum 3 patients per slot)",
        });
    }

    // Check if parent already booked this slot
    if (
      slot.patient_ids &&
      slot.patient_ids.some((id) => id.toString() === parentId.toString())
    ) {
      return res
        .status(400)
        .json({ message: "You have already booked this time slot" });
    }

    // Add parent to patient_ids array
    if (!schedule.slots[slotIndex].patient_ids) {
      schedule.slots[slotIndex].patient_ids = [];
    }
    schedule.slots[slotIndex].patient_ids.push(parentId);
    await schedule.save();

    const consultationTime = new Date(scheduleDate);
    const [hourStr, minuteStr] = start_time.split(":");
    if (!hourStr || !minuteStr) {
      return res
        .status(400)
        .json({ message: "start_time must be in HH:MM format" });
    }
    consultationTime.setHours(Number(hourStr), Number(minuteStr), 0, 0);

    const consultation = await consultationService.createConsultation({
      parent_id: parentId,
      baby_id,
      doctor_id,
      schedule_id: schedule._id,
      status: "waiting",
      consultation_time: consultationTime,
      notes,
    });

    // Create conversation and add initial message from parent with notes
    const conversation =
      await conversationService.createConversationWithConsultation(
        parentId,
        doctor_id,
        baby_id,
        consultation._id,
      );

    // Add initial message with notes as first message
    if (notes) {
      await conversationService.addMessageToConversation(conversation._id, {
        sender: "parent",
        content: notes,
        status: "sent",
        timestamp: new Date(),
      });
    }

    return res
      .status(201)
      .json({
        message: "Consultation scheduled successfully",
        data: consultation,
      });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const listConsultationDoctors = async (req, res) => {
  const parentId = req.user ? req.user.parent_id : null;

  try {
    if (!parentId) {
      return res.status(403).json({ message: "Parent role required" });
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
      message: "Consultation doctor list fetched",
      data: doctors,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const getDoctorUpcomingConsultations = async (req, res) => {
  const doctorId = req.user ? req.user.doctor_id : null;

  try {
    if (!doctorId) {
      return res.status(403).json({ message: "Doctor role required" });
    }

    const parsedLimit = Number(req.query.limit);
    const limit = Number.isFinite(parsedLimit) && parsedLimit > 0
      ? Math.min(parsedLimit, 50)
      : 10;

    await consultationService.syncDoctorConsultationStatuses(doctorId);

    const consultations =
      await consultationService.getUpcomingConsultationsByDoctor(doctorId, limit);

    return res.status(200).json({
      message: "Upcoming consultations fetched",
      data: consultations,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const getDoctorConsultationStats = async (req, res) => {
  const doctorId = req.user ? req.user.doctor_id : null;

  try {
    if (!doctorId) {
      return res.status(403).json({ message: "Doctor role required" });
    }

    await consultationService.syncDoctorConsultationStatuses(doctorId);

    const stats = await consultationService.getDoctorConsultationStats(doctorId);

    return res.status(200).json({
      message: "Doctor consultation stats fetched",
      data: stats,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const getDoctorConsultations = async (req, res) => {
  const doctorId = req.user ? req.user.doctor_id : null;

  try {
    if (!doctorId) {
      return res.status(403).json({ message: "Doctor role required" });
    }

    const { status, fromDate, toDate, search } = req.query;
    const parsedLimit = Number(req.query.limit);
    const limit = Number.isFinite(parsedLimit) && parsedLimit > 0
      ? Math.min(parsedLimit, 200)
      : 100;

    await consultationService.syncDoctorConsultationStatuses(doctorId);

    const consultations = await consultationService.getConsultationsByDoctor(
      doctorId,
      {
        status,
        fromDate,
        toDate,
        search,
        limit,
      },
    );

    return res.status(200).json({
      message: "Doctor consultations fetched",
      data: consultations,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const endDoctorConsultation = async (req, res) => {
  const doctorId = req.user ? req.user.doctor_id : null;

  try {
    if (!doctorId) {
      return res.status(403).json({ message: "Doctor role required" });
    }

    const { id } = req.params;
    const updated = await consultationService.endConsultationByDoctor(id, doctorId);

    if (!updated) {
      return res.status(404).json({ message: "Consultation not found" });
    }

    if (updated.invalidStatus) {
      return res.status(400).json({
        message: "Only in-progress consultations can be ended",
      });
    }

    return res.status(200).json({
      message: "Consultation ended successfully",
      data: updated,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const adminListConsultations = async (req, res) => {
  try {
    const { status, doctor_id, parent_id, baby_id } = req.query;
    const filter = {};

    if (status !== undefined) {
      filter.status = status;
    }

    if (doctor_id !== undefined) {
      filter.doctor_id = doctor_id;
    }

    if (parent_id !== undefined) {
      filter.parent_id = parent_id;
    }

    if (baby_id !== undefined) {
      filter.baby_id = baby_id;
    }

    const consultations = await consultationService.listConsultations(filter);

    return res.status(200).json({
      message: 'Consultation list fetched',
      data: consultations,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const adminGetConsultationDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const consultation = await consultationService.findConsultationById(id);

    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }

    return res.status(200).json({
      message: 'Consultation detail fetched',
      data: consultation,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const adminAssignDoctorToConsultation = async (req, res) => {
  try {
    const { id } = req.params;
    const { doctor_id } = req.body;

    if (!doctor_id) {
      return res.status(400).json({ message: 'doctor_id is required' });
    }

    const consultation = await consultationService.findConsultationById(id);
    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }

    const doctor = await doctorService.findDoctorById(doctor_id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const updated = await consultationService.updateConsultationById(id, {
      doctor_id,
    });

    return res.status(200).json({
      message: 'Doctor assigned to consultation successfully',
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const adminMonitorConsultationStatus = async (req, res) => {
  try {
    const summary = await consultationService.getConsultationStatusSummary();
    const consultations = await consultationService.listConsultations({});

    return res.status(200).json({
      message: 'Consultation status monitored',
      data: {
        summary,
        consultations,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  scheduleConsultation,
  listConsultationDoctors,
  getDoctorUpcomingConsultations,
  getDoctorConsultationStats,
  getDoctorConsultations,
  endDoctorConsultation,
  adminListConsultations,
  adminGetConsultationDetail,
  adminAssignDoctorToConsultation,
  adminMonitorConsultationStatus,
};
