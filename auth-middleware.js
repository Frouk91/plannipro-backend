const jwt = require('jsonwebtoken');
const db = require('./pool');

async function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token manquant ou invalide.' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const { rows } = await db.query(
            'SELECT id, email, first_name, last_name, role, team_id FROM agents WHERE id = $1 AND is_active = TRUE',
            [payload.sub]
        );
        if (!rows.length) return res.status(401).json({ error: 'Agent introuvable.' });
        req.agent = rows[0];
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Token expiré ou invalide.' });
    }
}

function requireRole(...roles) {
    return (req, res, next) => {
        if (!roles.includes(req.agent?.role)) {
            return res.status(403).json({ error: `Accès réservé aux rôles : ${roles.join(', ')}.` });
        }
        next();
    };
}

module.exports = { authenticate, requireRole };