const bcrypt = require('bcryptjs');

const accountService = require('../services/accountService');
const doctorService = require('../services/doctorService');

const normalizeExperienceInput = (experience) => {
    if (experience === undefined) {
        return [];
    }

    if (!Array.isArray(experience)) {
        return null;
    }

    const normalizedExperience = [];

    for (const item of experience) {
        if (!item || typeof item !== 'object' || !item.certificate_name) {
            return null;
        }

        normalizedExperience.push({
            certificate_name: item.certificate_name,
            certificate_url: item.certificate_url,
            created_at: item.created_at,
        });
    }

    return normalizedExperience;
};

const addDoctor = async (req, res) => {
    const { email, password, phone, full_name, avatar_url, experience, specialty } = req.body;

    try {
        if (!email || !password || !full_name) {
            return res.status(400).json({
                message: 'email, password, and full_name are required',
            });
        }

        const normalizedExperience = normalizeExperienceInput(experience);
        if (normalizedExperience === null) {
            return res.status(400).json({
                message: 'experience must be an array of objects containing certificate_name',
            });
        }

        const existingAccount = await accountService.findAccountByEmail(email);
        if (existingAccount) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        const createdDoctor = await doctorService.createDoctor({
            full_name,
            avatar_url,
            specialty,
            experience: normalizedExperience,
        });

        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            const createdAccount = await accountService.createAccount({
                doctor_id: createdDoctor._id,
                email,
                password: hashedPassword,
                phone,
                role: 'doctor',
                is_verified: true,
            });

            return res.status(201).json({
                message: 'Doctor created successfully',
                data: {
                    doctor: createdDoctor,
                    account: {
                        account_id: createdAccount._id,
                        email: createdAccount.email,
                        role: createdAccount.role,
                        doctor_id: createdAccount.doctor_id,
                    },
                },
            });
        } catch (accountError) {
            await doctorService.deleteDoctorById(createdDoctor._id);
            throw accountError;
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const listDoctors = async (req, res) => {
    const { specialty } = req.query;

    try {
        const filter = {};
        if (specialty) {
            filter.specialty = new RegExp(specialty, 'i');
        }

        const doctors = await doctorService.listDoctors(filter);

        return res.status(200).json({
            message: 'Doctor list fetched',
            data: doctors,
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getDoctorDetail = async (req, res) => {
    const { id } = req.params;

    try {
        const doctor = await doctorService.findDoctorById(id);
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        return res.status(200).json({ message: 'Doctor detail fetched', data: doctor });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    addDoctor,
    listDoctors,
    getDoctorDetail,
};