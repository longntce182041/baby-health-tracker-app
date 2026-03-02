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

const updateDoctorProfile = async (req, res) => {
    const { full_name, avatar_url, specialty, experience } = req.body;
    const doctorId = req.user.doctor_id;

    try {
        if (!doctorId) {
            return res.status(400).json({ message: 'Doctor ID not found in token' });
        }

        const doctor = await doctorService.findDoctorById(doctorId);
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor profile not found' });
        }

        const updateData = {};
        if (full_name !== undefined) updateData.full_name = full_name;
        if (avatar_url !== undefined) updateData.avatar_url = avatar_url;
        if (specialty !== undefined) updateData.specialty = specialty;

        if (experience !== undefined) {
            const normalizedExperience = normalizeExperienceInput(experience);
            if (normalizedExperience === null) {
                return res.status(400).json({
                    message: 'experience must be an array of objects containing certificate_name',
                });
            }
            updateData.experience = normalizedExperience;
        }

        const updatedDoctor = await doctorService.updateDoctor(doctorId, updateData);

        return res.status(200).json({
            message: 'Doctor profile updated successfully',
            data: updatedDoctor,
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const viewDoctorProfile = async (req, res) => {
    try {
        const accountId = req.user ? req.user.account_id : null;
        if (!accountId) {
            return res.status(401).json({ message: 'Missing token' });
        }

        const account = await accountService.findAccountById(accountId);
        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }

        if (account.role !== 'doctor') {
            return res.status(403).json({ message: 'Doctor role required' });
        }

        const doctorId = account.doctor_id;
        if (!doctorId) {
            return res.status(400).json({ message: 'Doctor profile not associated with account' });
        }

        const doctor = await doctorService.findDoctorById(doctorId);
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor profile not found' });
        }

        const profile = doctor.toObject();
        profile.email = account.email;
        profile.phone = account.phone;
        profile.account_id = account._id;

        res.status(200).json({ message: 'Doctor profile fetched', data: profile });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const viewDoctorProfileAsParent = async (req, res) => {
    const { id } = req.params;

    try {
        const doctor = await doctorService.findDoctorById(id);
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        const profile = doctor.toObject();

        // Remove sensitive information
        // Keep: full_name, avatar_url, specialty, experience
        const publicProfile = {
            _id: profile._id,
            full_name: profile.full_name,
            avatar_url: profile.avatar_url,
            specialty: profile.specialty,
            experience: profile.experience,
            created_at: profile.created_at,
        };

        return res.status(200).json({ message: 'Doctor profile fetched', data: publicProfile });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    addDoctor,
    listDoctors,
    getDoctorDetail,
    updateDoctorProfile,
    viewDoctorProfile,
    viewDoctorProfileAsParent,
};