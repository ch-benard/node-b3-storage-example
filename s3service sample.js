import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import dotenv from "dotenv";

dotenv.config();

const generateFileName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');
import sharp from 'sharp'

export default async function s3Uploadv3(file) {

    const region = process.env.AWS_REGION
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY

    const s3Client = new S3Client({
        region,
        credentials: {
            accessKeyId,
            secretAccessKey
        }
    });
    // const params = files.map(file => {
    //     return {
    //         Bucket: process.env.AWS_BUCKET_NAME,
    //         Key: `uploads/${uuid()}-${file.originalname}`,
    //         Body: file.buffer,
    //     }
    // });
    console.log(file);

    const fileBuffer = await sharp(file.buffer)
        .resize({ height: 1920, width: 1080, fit: "contain" })
        .toBuffer();

    const fileName = generateFileName();
    const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Body: fileBuffer,
        Key: fileName,
        ContentType: file.mimetype
    }

    console.log(`region: ${region}`);

    // Send the upload to S3
    await s3Client.send(new PutObjectCommand(uploadParams));

    //   return await s3Client.send(new PutObjectCommand(param));

    // return await Promise.all(params.map(param => {
    //     // s3.upload(param).promise();
    //     s3Client.send(new PutObjectCommand(param));
    // }));
};