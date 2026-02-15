const Account = require('../models/accounts');


const createAccount = async (accountData) => {
    const account = new Account(accountData);
    return await account.save();
}

const findAccountByEmail = async (email) => {
    return await Account.findOne({ email });
}

const findAccountById = async (accountId) => {
    return await Account.findById(accountId);
}

const updateAccountPassword = async (email, hashedPassword) => {
    return await Account.findOneAndUpdate(
        { email },
        { password: hashedPassword },
        { new: true }
    );
}

const updateAccountPasswordById = async (accountId, hashedPassword) => {
    return await Account.findByIdAndUpdate(
        accountId,
        { password: hashedPassword },
        { new: true }
    );
}

const updateAccountById = async (accountId, updateData) => {
    return await Account.findByIdAndUpdate(accountId, updateData, { new: true });
}

const deleteAccount = async (accountId) => {
    return await Account.findByIdAndDelete(accountId);
}

module.exports = {
    createAccount,
    findAccountByEmail,
    findAccountById,
    updateAccountPassword,
    updateAccountPasswordById,
    updateAccountById,
    deleteAccount
}