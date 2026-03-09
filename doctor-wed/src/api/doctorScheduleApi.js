import api from "./api";

export const getDoctorOwnSchedules = async ({ fromDate, toDate } = {}) => {
    try {
        const params = {};
        if (fromDate) {
            params.from_date = fromDate;
        }
        if (toDate) {
            params.to_date = toDate;
        }

        const res = await api.get("/doctor/schedules", { params });
        return res.data?.data || [];
    } catch (error) {
        throw (
            error.response?.data || {
                message: error.message || "Không thể tải lịch làm việc",
            }
        );
    }
};

export const registerDoctorScheduleDay = async ({ date, slots, note }) => {
    try {
        const res = await api.post("/doctor/schedules/day", {
            date,
            slots,
            note,
        });

        return res.data?.data;
    } catch (error) {
        throw (
            error.response?.data || {
                message: error.message || "Không thể đăng kí lịch làm việc",
            }
        );
    }
};
