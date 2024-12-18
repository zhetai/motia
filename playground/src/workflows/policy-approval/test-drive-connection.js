import "dotenv/config";
import { google } from "googleapis";

const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS); // ensure this is set
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/drive.readonly"],
});
const client = await auth.getClient();
const drive = google.drive({ version: "v3", auth: client });

const res = await drive.files.export({
  fileId: "1dv_MRAIx7gicAsfGGhrYgIM_nWlZBBl3h6REA-wNlQI",
  mimeType: "text/plain",
});
console.log(res.data);
