const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = 'uploads/';

if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniquePrefix = Date.now();
        const sanitizedOriginalName = file.originalname.replace(/\s+/g, '_');
        cb(null, uniquePrefix + '-' + sanitizedOriginalName);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedExts = ['.jpeg', '.jpg', '.png', '.pdf', '.xlsx', '.csv'];
    const allowedMimetypes = [
        'image/jpeg',
        'image/png',
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv'
    ];

    const extname = path.extname(file.originalname).toLowerCase();
    
    if (allowedExts.includes(extname)) {
        return cb(null, true);
    }
    
    cb(new Error('Tipo de arquivo não suportado.'));
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 10 },
    fileFilter: fileFilter
});

module.exports = upload;