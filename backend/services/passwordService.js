const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const saltRounds = 12;

const hashPassword = async (password) => {
    return bcrypt.hash(password, saltRounds);
};

const isBcryptPassword = (value) => {
    return typeof value === 'string' && /^\$2[aby]\$\d{2}\$/.test(value);
};

const isLegacyPbkdf2Password = (value) => {
    return typeof value === 'string' && value.startsWith('pbkdf2$');
};

const verifyLegacyPbkdf2Password = (password, storedPassword) => {
    const parts = storedPassword.split('$');
    if (parts.length !== 4) return false;

    const iterations = Number(parts[1]);
    const salt = parts[2];
    const storedHash = parts[3];
    const calculatedHash = crypto
        .pbkdf2Sync(password, salt, iterations, 64, 'sha512')
        .toString('hex');

    const calculatedBuffer = Buffer.from(calculatedHash, 'hex');
    const storedBuffer = Buffer.from(storedHash, 'hex');

    if (calculatedBuffer.length !== storedBuffer.length) return false;
    return crypto.timingSafeEqual(calculatedBuffer, storedBuffer);
};

const verifyPassword = async (password, storedPassword) => {
    if (isBcryptPassword(storedPassword)) {
        return bcrypt.compare(password, storedPassword);
    }

    if (isLegacyPbkdf2Password(storedPassword)) {
        return verifyLegacyPbkdf2Password(password, storedPassword);
    }

    return password === storedPassword;
};

const needsPasswordRehash = (storedPassword) => {
    return !isBcryptPassword(storedPassword);
};

module.exports = {
    hashPassword,
    needsPasswordRehash,
    verifyPassword
};
