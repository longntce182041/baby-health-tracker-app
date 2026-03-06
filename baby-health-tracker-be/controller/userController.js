const bcrypt = require('bcryptjs');
const accountService = require('../services/accountService');
const parentService = require('../services/parentService');
const babyService = require('../services/babyService');
const doctorService = require('../services/doctorService');

const normalizeExperienceInput = (experience) => {
    if (experience === undefined) {
        return undefined;
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

const normalizeStatusInput = (status) => {
    if (typeof status === 'boolean') {
        return status;
    }

    if (status === 'true') {
        return true;
    }

    if (status === 'false') {
        return false;
    }

    return null;
};

const viewProfile = async (req, res) => {
    try {
        const accountId = req.user ? req.user.account_id : null;
        if (!accountId) {
            return res.status(401).json({ message: 'Missing token' });
        }

        const account = await accountService.findAccountById(accountId);
        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }

        const profile = account.toObject();
        delete profile.password;

        let parent = null;
        if (account.role === 'parent' && account.parent_id) {
            parent = await parentService.findParentById(account.parent_id);
            profile.parent = parent || null;
        }

        profile.phone = profile.phone || null;
        profile.full_name = parent ? (parent.full_name || null) : null;
        profile.avatar_url = parent ? (parent.avatar_url || null) : null;

        res.status(200).json({ message: 'Profile fetched', data: profile });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        const accountId = req.user ? req.user.account_id : null;
        if (!accountId) {
            return res.status(401).json({ message: 'Missing token' });
        }

        const { phone, full_name, avatar_url } = req.body;
        const account = await accountService.findAccountById(accountId);
        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }

        const accountUpdates = {};
        const parentUpdates = {};

        if (phone !== undefined) {
            accountUpdates.phone = phone;
        }
        if (full_name !== undefined) {
            parentUpdates.full_name = full_name;
        }
        if (avatar_url !== undefined) {
            parentUpdates.avatar_url = avatar_url;
        }

        const updateTasks = [];
        if (Object.keys(accountUpdates).length > 0) {
            updateTasks.push(accountService.updateAccountById(accountId, accountUpdates));
        }

        if (account.role === 'parent' && account.parent_id && Object.keys(parentUpdates).length > 0) {
            updateTasks.push(parentService.updateParentById(account.parent_id, parentUpdates));
        }

        if (updateTasks.length > 0) {
            await Promise.all(updateTasks);
        }

        const updatedAccount = await accountService.findAccountById(accountId);
        const profile = updatedAccount.toObject();
        delete profile.password;

        let parent = null;
        if (updatedAccount.role === 'parent' && updatedAccount.parent_id) {
            parent = await parentService.findParentById(updatedAccount.parent_id);
            profile.parent = parent;
        }

        profile.phone = profile.phone || null;
        profile.full_name = parent ? (parent.full_name || null) : null;
        profile.avatar_url = parent ? (parent.avatar_url || null) : null;

        res.status(200).json({ message: 'Profile updated', data: profile });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const changePassword = async (req, res) => {
    try {
        const accountId = req.user ? req.user.account_id : null;
        if (!accountId) {
            return res.status(401).json({ message: 'Missing token' });
        }

        const { current_password, new_password } = req.body;
        if (!current_password || !new_password) {
            return res.status(400).json({ message: 'current_password and new_password are required' });
        }

        const account = await accountService.findAccountById(accountId);
        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }

        const isMatch = await bcrypt.compare(current_password, account.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        const hashedPassword = await bcrypt.hash(new_password, 10);
        await accountService.updateAccountPasswordById(accountId, hashedPassword);

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const viewParentProfile = async (req, res) => {
    try {
        const accountId = req.user ? req.user.account_id : null;
        if (!accountId) {
            return res.status(401).json({ message: 'Missing token' });
        }

        const account = await accountService.findAccountById(accountId);
        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }

        if (account.role !== 'parent') {
            return res.status(403).json({ message: 'Parent role required' });
        }

        const profile = account.toObject();
        delete profile.password;

        let parent = null;
        if (account.parent_id) {
            parent = await parentService.findParentById(account.parent_id);
            profile.parent = parent || null;
        }

        // Fetch babies for this parent
        let babies = [];
        if (account.parent_id) {
            babies = await babyService.listBabies(account.parent_id);
        }

        profile.phone = profile.phone || null;
        profile.full_name = parent ? (parent.full_name || null) : null;
        profile.avatar_url = parent ? (parent.avatar_url || null) : null;
        profile.wallet_points = parent ? (parent.wallet_points || 0) : 0;
        profile.babies = babies || [];

        res.status(200).json({ message: 'Parent profile fetched', data: profile });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const adminListParents = async (req, res) => {
    try {
        const parentAccounts = await accountService.listAccountsByRole('parent');
        const parentIds = parentAccounts
            .map((account) => account.parent_id)
            .filter(Boolean);

        const parents = await parentService.listParentsByIds(parentIds);
        const parentMap = new Map(parents.map((parent) => [parent._id.toString(), parent]));

        const data = parentAccounts.map((account) => {
            const parent = account.parent_id ? parentMap.get(account.parent_id.toString()) : null;

            return {
                account_id: account._id,
                email: account.email,
                phone: account.phone || null,
                role: account.role,
                status: account.status,
                is_verified: account.is_verified,
                created_at: account.created_at,
                parent,
            };
        });

        return res.status(200).json({ message: 'Parent list fetched', data });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const adminGetParentDetail = async (req, res) => {
    try {
        const { account_id } = req.params;
        const account = await accountService.findAccountByIdAndRole(account_id, 'parent');

        if (!account) {
            return res.status(404).json({ message: 'Parent account not found' });
        }

        const parent = account.parent_id
            ? await parentService.findParentById(account.parent_id)
            : null;

        return res.status(200).json({
            message: 'Parent detail fetched',
            data: {
                account_id: account._id,
                email: account.email,
                phone: account.phone || null,
                role: account.role,
                status: account.status,
                is_verified: account.is_verified,
                created_at: account.created_at,
                parent,
            },
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const adminUpdateParent = async (req, res) => {
    try {
        const { account_id } = req.params;
        const { phone, full_name, avatar_url } = req.body;

        const account = await accountService.findAccountByIdAndRole(account_id, 'parent');
        if (!account) {
            return res.status(404).json({ message: 'Parent account not found' });
        }

        const accountUpdates = {};
        const parentUpdates = {};

        if (phone !== undefined) {
            accountUpdates.phone = phone;
        }

        if (full_name !== undefined) {
            parentUpdates.full_name = full_name;
        }

        if (avatar_url !== undefined) {
            parentUpdates.avatar_url = avatar_url;
        }

        const updateTasks = [];
        if (Object.keys(accountUpdates).length > 0) {
            updateTasks.push(accountService.updateAccountById(account._id, accountUpdates));
        }

        if (account.parent_id && Object.keys(parentUpdates).length > 0) {
            updateTasks.push(parentService.updateParentById(account.parent_id, parentUpdates));
        }

        if (updateTasks.length > 0) {
            await Promise.all(updateTasks);
        }

        const updatedAccount = await accountService.findAccountByIdAndRole(account_id, 'parent');
        const updatedParent = updatedAccount.parent_id
            ? await parentService.findParentById(updatedAccount.parent_id)
            : null;

        return res.status(200).json({
            message: 'Parent updated successfully',
            data: {
                account_id: updatedAccount._id,
                email: updatedAccount.email,
                phone: updatedAccount.phone || null,
                role: updatedAccount.role,
                status: updatedAccount.status,
                is_verified: updatedAccount.is_verified,
                created_at: updatedAccount.created_at,
                parent: updatedParent,
            },
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const adminChangeParentStatus = async (req, res) => {
    try {
        const { account_id } = req.params;
        const parsedStatus = normalizeStatusInput(req.body.status);

        if (parsedStatus === null) {
            return res.status(400).json({ message: 'status must be boolean (true/false)' });
        }

        const account = await accountService.findAccountByIdAndRole(account_id, 'parent');
        if (!account) {
            return res.status(404).json({ message: 'Parent account not found' });
        }

        const updatedAccount = await accountService.updateAccountStatusById(account_id, parsedStatus);

        return res.status(200).json({
            message: 'Parent account status updated',
            data: {
                account_id: updatedAccount._id,
                status: updatedAccount.status,
            },
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const adminListDoctors = async (req, res) => {
    try {
        const doctorAccounts = await accountService.listAccountsByRole('doctor');
        const doctorIds = doctorAccounts
            .map((account) => account.doctor_id)
            .filter(Boolean);

        const doctors = await doctorService.listDoctorsByIds(doctorIds);
        const doctorMap = new Map(doctors.map((doctor) => [doctor._id.toString(), doctor]));

        const data = doctorAccounts.map((account) => {
            const doctor = account.doctor_id ? doctorMap.get(account.doctor_id.toString()) : null;

            return {
                account_id: account._id,
                email: account.email,
                phone: account.phone || null,
                role: account.role,
                status: account.status,
                is_verified: account.is_verified,
                created_at: account.created_at,
                doctor,
            };
        });

        return res.status(200).json({ message: 'Doctor list fetched', data });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const adminGetDoctorDetail = async (req, res) => {
    try {
        const { account_id } = req.params;
        const account = await accountService.findAccountByIdAndRole(account_id, 'doctor');

        if (!account) {
            return res.status(404).json({ message: 'Doctor account not found' });
        }

        const doctor = account.doctor_id
            ? await doctorService.findDoctorById(account.doctor_id)
            : null;

        return res.status(200).json({
            message: 'Doctor detail fetched',
            data: {
                account_id: account._id,
                email: account.email,
                phone: account.phone || null,
                role: account.role,
                status: account.status,
                is_verified: account.is_verified,
                created_at: account.created_at,
                doctor,
            },
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const adminAddDoctor = async (req, res) => {
    try {
        const { email, password, phone, full_name, avatar_url, experience, specialty } = req.body;

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
            experience: normalizedExperience || [],
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
                status: true,
            });

            return res.status(201).json({
                message: 'Doctor created successfully',
                data: {
                    account_id: createdAccount._id,
                    email: createdAccount.email,
                    phone: createdAccount.phone || null,
                    role: createdAccount.role,
                    status: createdAccount.status,
                    is_verified: createdAccount.is_verified,
                    doctor: createdDoctor,
                },
            });
        } catch (accountError) {
            await doctorService.deleteDoctorById(createdDoctor._id);
            throw accountError;
        }
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const adminUpdateDoctor = async (req, res) => {
    try {
        const { account_id } = req.params;
        const { phone, full_name, avatar_url, specialty, experience } = req.body;

        const account = await accountService.findAccountByIdAndRole(account_id, 'doctor');
        if (!account) {
            return res.status(404).json({ message: 'Doctor account not found' });
        }

        const accountUpdates = {};
        const doctorUpdates = {};

        if (phone !== undefined) {
            accountUpdates.phone = phone;
        }

        if (full_name !== undefined) {
            doctorUpdates.full_name = full_name;
        }

        if (avatar_url !== undefined) {
            doctorUpdates.avatar_url = avatar_url;
        }

        if (specialty !== undefined) {
            doctorUpdates.specialty = specialty;
        }

        if (experience !== undefined) {
            const normalizedExperience = normalizeExperienceInput(experience);
            if (normalizedExperience === null) {
                return res.status(400).json({
                    message: 'experience must be an array of objects containing certificate_name',
                });
            }

            doctorUpdates.experience = normalizedExperience;
        }

        const updateTasks = [];
        if (Object.keys(accountUpdates).length > 0) {
            updateTasks.push(accountService.updateAccountById(account._id, accountUpdates));
        }

        if (account.doctor_id && Object.keys(doctorUpdates).length > 0) {
            updateTasks.push(doctorService.updateDoctor(account.doctor_id, doctorUpdates));
        }

        if (updateTasks.length > 0) {
            await Promise.all(updateTasks);
        }

        const updatedAccount = await accountService.findAccountByIdAndRole(account_id, 'doctor');
        const updatedDoctor = updatedAccount.doctor_id
            ? await doctorService.findDoctorById(updatedAccount.doctor_id)
            : null;

        return res.status(200).json({
            message: 'Doctor updated successfully',
            data: {
                account_id: updatedAccount._id,
                email: updatedAccount.email,
                phone: updatedAccount.phone || null,
                role: updatedAccount.role,
                status: updatedAccount.status,
                is_verified: updatedAccount.is_verified,
                created_at: updatedAccount.created_at,
                doctor: updatedDoctor,
            },
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const adminChangeDoctorStatus = async (req, res) => {
    try {
        const { account_id } = req.params;
        const parsedStatus = normalizeStatusInput(req.body.status);

        if (parsedStatus === null) {
            return res.status(400).json({ message: 'status must be boolean (true/false)' });
        }

        const account = await accountService.findAccountByIdAndRole(account_id, 'doctor');
        if (!account) {
            return res.status(404).json({ message: 'Doctor account not found' });
        }

        const updatedAccount = await accountService.updateAccountStatusById(account_id, parsedStatus);

        return res.status(200).json({
            message: 'Doctor account status updated',
            data: {
                account_id: updatedAccount._id,
                status: updatedAccount.status,
            },
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    viewProfile,
    updateProfile,
    changePassword,
    viewParentProfile,
    adminListParents,
    adminGetParentDetail,
    adminUpdateParent,
    adminChangeParentStatus,
    adminListDoctors,
    adminGetDoctorDetail,
    adminAddDoctor,
    adminUpdateDoctor,
    adminChangeDoctorStatus,
};
