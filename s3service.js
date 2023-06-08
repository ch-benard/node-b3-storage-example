import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from 'uuid';
import dotenv from "dotenv";
// import sharp from 'sharp'

dotenv.config();

export default async function s3Uploadv3(files) {

    const region = process.env.AWS_REGION;
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const endpoint_url = process.env.AWS_ENDPOINT_URL;

    const s3Client = new S3Client({
        region,
        bucketEndpoint: false,
        endpoint: {
            hostname: endpoint_url,
            protocol: 'https',
            path: '',
        },
        forcePathStyle: true | false,
        credentials: {
            accessKeyId,
            secretAccessKey
        }
    });

    const params = files.map(file => {
        return {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `uploads/${uuidv4()}-${file.originalname}`,
            Body: file.buffer,
            ContentType: file.mimetype,
        }
    });

    // const fileBuffer = await sharp(file.buffer)
    //     .resize({ height: 1920, width: 1080, fit: "contain" })
    //     .toBuffer();

    return await Promise.all(params.map(param => {
        s3Client.send(new PutObjectCommand(param));
    }));
};