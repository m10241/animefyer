//import required modules
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 5000; 

//creat uploads file if does not exist
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Multer Configuration for File Uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

//validation check
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: function (req, file, cb) {
        
        const allowedMimes = ['image/jpeg', 'image/pjpeg'];
        const allowedExt = ['.jpg', '.jpeg'];
        
        const isMimeValid = allowedMimes.includes(file.mimetype);
        const isExtValid = allowedExt.includes(
            path.extname(file.originalname).toLowerCase()
        );
        
        if (isMimeValid && isExtValid) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG/JPG allowed!'), false);
        }
    }
});

 // Serve static files from public directory
app.use(express.static('public'));

// Serve HTML form at root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle file upload POST requests
app.post('/upload', upload.single('photo'), (req, res) => {
    try {
        // Check if file was actually received
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded!' });
        }
        res.json({ 
            message: 'Upload successful!',
            filename: req.file.filename
        });

        // Handle unexpected server errors
    } catch (err) {
        res.status(500).json({ message: 'Server error!' });
    }
});

// Error Handling
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({ message: 'File too large! Max 5MB allowed!' });
        }
        return res.status(400).json({ message: err.message });
    } else if (err) {
        return res.status(400).json({ message: err.message });
    }
    next();
});

// Server Initialization
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});