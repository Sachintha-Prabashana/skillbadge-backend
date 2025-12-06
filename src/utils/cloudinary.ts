import cloudinary from "../config/cloudinary";
import streamifier from "streamifier"

export const uploadToCloudinary = async (buffer: Buffer): Promise<string> => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: "skillbadge_avatars",
                transformation: [
                    { width: 250, height: 250, crop: "fill", gravity: "face" },
                    { quality: "auto", fetch_format: "auto"}
                ]
            },
            (error, result) => {
                if (error) return reject(error)
                if(result) return resolve(result.secure_url)
            }
        )

        streamifier.createReadStream(buffer).pipe(stream)
    })
}

