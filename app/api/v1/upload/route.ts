import {fail, ok} from "@/libs/response"
import { v2 as cloudinary } from "cloudinary";
import { getAuthUser } from "@/middleware/checkAuth";


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) return fail("Unauthorized", 401);

    const formData = await req.formData();
    const file = formData.get("file");
    if (!file || typeof file === "string") {
      return fail("No file provided");
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "tripfund/avatars", resource_type: "image" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(buffer);
    });

    return ok({ url: uploadResult.secure_url });
  } catch (err) {
    console.log("error while fetching upload image", err)

    return fail(err.message, 500);
  }
}
