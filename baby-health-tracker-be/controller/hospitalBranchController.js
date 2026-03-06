const hospitalBranchService = require('../services/hospitalBranchService');

const addHospitalBranch = async (req, res) => {
    const { branch_name, address } = req.body;

    try {
        if (!branch_name || !address) {
            return res.status(400).json({ message: 'branch_name and address are required' });
        }

        const created = await hospitalBranchService.createBranch({ branch_name, address });
        return res.status(201).json({ message: 'Hospital branch created', data: created });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const listHospitalBranches = async (req, res) => {
    try {
        const branches = await hospitalBranchService.listBranches();
        return res.status(200).json({ message: 'Hospital branch list fetched', data: branches });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getHospitalBranchDetail = async (req, res) => {
    const { id } = req.params;

    try {
        const branch = await hospitalBranchService.findBranchById(id);
        if (!branch) {
            return res.status(404).json({ message: 'Hospital branch not found' });
        }

        return res.status(200).json({ message: 'Hospital branch detail fetched', data: branch });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const updateHospitalBranch = async (req, res) => {
    const { id } = req.params;
    const { branch_name, address } = req.body;

    try {
        const branch = await hospitalBranchService.findBranchById(id);
        if (!branch) {
            return res.status(404).json({ message: 'Hospital branch not found' });
        }

        const updateData = {};
        if (branch_name !== undefined) updateData.branch_name = branch_name;
        if (address !== undefined) updateData.address = address;

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: 'No update fields provided' });
        }

        const updated = await hospitalBranchService.updateBranchById(id, updateData);
        return res.status(200).json({ message: 'Hospital branch updated', data: updated });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const deleteHospitalBranch = async (req, res) => {
    const { id } = req.params;

    try {
        const branch = await hospitalBranchService.findBranchById(id);
        if (!branch) {
            return res.status(404).json({ message: 'Hospital branch not found' });
        }

        await hospitalBranchService.deleteBranchById(id);
        return res.status(200).json({ message: 'Hospital branch deleted' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    addHospitalBranch,
    listHospitalBranches,
    getHospitalBranchDetail,
    updateHospitalBranch,
    deleteHospitalBranch,
};
