const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");
const util = require("util");

// Convert fs.writeFile and fs.unlink to promise-based functions
const writeFile = util.promisify(fs.writeFile);
const unlinkFile = util.promisify(fs.unlink);

// Google Drive Authentication
// const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
// console.log("Google Service Account Credentials:", credentials);
const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, "service-account.json"), // Ensure correct path
    // credentials,
    scopes: ["https://www.googleapis.com/auth/drive.file"],
});

const drive = google.drive({ version: "v3", auth });

/**
 * Uploads a file to Google Drive and returns the file link.
 * @param {Object} file - The file object from multer (buffer, mimetype, originalname).
 * @returns {Promise<string>} - Publicly accessible Google Drive file link.
 */

const uploadToDrive = async (file) => {
    try {
        // Ensure 'uploads/' directory exists
        const uploadDir = path.join(__dirname, "../uploads");
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Write file buffer to a temporary file
        const tempFilePath = path.join(uploadDir, file.originalname);
        console.log("Temp file path:", tempFilePath);

        await writeFile(tempFilePath, file.buffer);

        // Debugging: Check if the file was successfully created
        if (!fs.existsSync(tempFilePath)) {
            throw new Error(`File not found after writing: ${tempFilePath}`);
        }

        // Debugging: Check if folder ID is set
        if (!process.env.GOOGLE_DRIVE_FOLDER_ID) {
            throw new Error("GOOGLE_DRIVE_FOLDER_ID is not defined in environment variables.");
        }
        console.log("Google Drive Folder ID:", process.env.GOOGLE_DRIVE_FOLDER_ID);

        // Prepare metadata and file stream
        const fileMetadata = {
            name: file.originalname,
            parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
        };

        const media = {
            mimeType: file.mimetype,
            body: fs.createReadStream(tempFilePath),
        };

        // Upload file to Google Drive
        const response = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: "id",
        });

        if (!response.data.id) {
            throw new Error("Failed to get file ID from Google Drive response.");
        }
        const fileId = response.data.id;

        // Make the file publicly accessible
        await drive.permissions.create({
            fileId,
            requestBody: {
                role: "reader",
                type: "anyone",
            },
        });

        // Get the public file link
        const fileLink = `https://drive.google.com/file/d/${fileId}/view`;

        console.log("Uploaded File Link:", fileLink);

        // Delete the temp file after successful upload
        await unlinkFile(tempFilePath);

        return fileLink;
    } catch (error) {
        console.error("Google Drive Upload Error:", error);
        throw new Error("Failed to upload file to Google Drive");
    }
};

module.exports = uploadToDrive;
