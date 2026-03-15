import { uploadUrl } from "@/utils/conts";
import axios from "axios";

interface UploadResponse {
  status: boolean;
  data: string;
  message: string;
  function: string;
}

export async function uploadFile(file: File, path: string): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  
  const response = await axios({
    method: "post",
    url: `${uploadUrl}${path}`,
    data: formData,
  });
  
  return response.data;
}

export async function uploadUserProfile(file: File): Promise<UploadResponse> {
  return uploadFile(file, "users");
}
