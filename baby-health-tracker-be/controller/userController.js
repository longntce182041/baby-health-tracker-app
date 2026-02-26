const bcrypt = require('bcryptjs');
const accountService = require('../services/accountService');
const parentService = require('../services/parentService');

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

module.exports = {
    viewProfile,
    updateProfile,
    changePassword,
};
