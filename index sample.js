import express from 'express'
import multer from 'multer';
import s3Uploadv3 from './s3service.js'


const app = express();

// const upload = multer({ dest: "uploads" });

// single file upload
// app.post('/upload', upload.single("file"), (req, res) => {
//     res.json({ status: "success" });
// });

// multiple files upload
// app.post('/upload', upload.array("file", 2), (req, res) => {
//     res.json({ status: "success" });
// });

// Store on local disk
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, "uploads")
//     },
//     filename: (req, file, cb) => {
//         const { originalname } = file;
//         cb(null, `${uuid()}-${originalname}`);
//     },
// });
// uuid-originalName

// Store on S3 Bucket
const storage = multer.memoryStorage();

// multiple files upload with custom files names
const fileFilter = (req, file, cb) => {
    if (file.mimetype.split("/")[0] === 'image') {
        cb(null, true);
    } else {
        cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE"), false);
    }
}

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 1000000,
        files: 2,
    }
});

// app.post('/upload', upload.array("file"), (req, res) => {
//     res.json({ status: "success" });
// });

// S3 v3
app.post('/upload', upload.array("file"), async (req, res) => {
    console.log(req.files);

    const file = req.files[0];

    try {
        const results = await s3Uploadv3(file);
        console.log(results);
        res.json({ status: "success" });
    } catch (error) {
        console.timeLog(error);
    }
});

// multiple fields files upload
// const multiUpload = upload.fields([
//     { name: "avatar", maxCount: 1 },
//     { name: "resume", maxCount: 1 },
// ]);
// app.post('/upload', multiUpload, (req, res) => {
//     console.log(req.files);
//     res.json({ status: "success" });
// });

app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                message: "File is too large !",
            });
        }

        if (error.code === "LIMIT_FILE_COUNT") {
            return res.status(400).json({
                message: "File limit reached !",
            });
        }

        if (error.code === "LIMIT_UNEXPECTED_FILE") {
            return res.status(400).json({
                message: "File must be an image !",
            });
        }

    }
});

app.listen(4000, () => console.log("S3 Bucket test application listening  on port 4000"));