const jwt = require('jsonwebtoken');

const getJwtSecret = () => process.env.JWT_SECRET || '12345-67890-09876-54321';

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
        return res.status(401).json({ message: 'Missing token' });
    }

    try {
        const decoded = jwt.verify(token, getJwtSecret());
        req.user = decoded;
        return next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

const requireParent = (req, res, next) => {
    if (!req.user || req.user.role !== 'parent') {
        return res.status(403).json({ message: 'Parent role required' });
    }

    return next();
};

const requireDoctor = (req, res, next) => {
    if (!req.user || req.user.role !== 'doctor') {
        return res.status(403).json({ message: 'Doctor role required' });
    }

    return next();
};

const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin role required' });
    }

    return next();
};

module.exports = {
    authenticateToken,
    requireParent,
    requireDoctor,
    requireAdmin,
};
