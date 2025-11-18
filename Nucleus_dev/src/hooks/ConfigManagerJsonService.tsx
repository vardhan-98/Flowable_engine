// hooks/useConfigManagerJsonService.ts
import { useState } from "react";
// import API_URLS from "../utils/ApiUrls";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import type { JsonFileUploadResponse } from "../types/ConfigMangerJsonInterface";
import { API_URLS } from "../utils/ApiUrls";


export default function useConfigManagerJsonService() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
 

  const deviceActivation = async () => {
    try {
      setLoading(true);

      const response = await fetch("", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Failed request");

      const data: string = await response.text();

      if (data) {
        toast.success(data);
        navigate("/order-progress?stage=complete");
      } else {
        toast.error("Failed to start orchestration");
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  // JSON File Upload API
  const uploadJsonFile = async (file: File): Promise<boolean> => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(API_URLS.UPLOAD_JSON, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
      }

      const data = await response.json();

      if (data?.message) {
        toast.success(data.message); // ✅ show backend message
        return true;
      } else {
        toast.error("Unexpected API response");
        return false;
      }
    } catch (error: any) {
      console.error("Upload JSON Error:", error);
      toast.error(error.message || "Something went wrong during upload");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Get Tree Data
  const fetchTreeData = async (fileName: string): Promise<any | null> => {

    try {
      setLoading(true);

      // const cleanFileName = fileName.replace(".json", "");
      const url = `${API_URLS.GET_TREE_DATA}/${fileName}`;

      const response = await fetch(url);

      if (!response.ok) throw new Error("Failed to fetch JSON data");

      const data = await response.json();
      return data;
    } catch (error: any) {
      toast.error(error.message || "Error fetching JSON data");
    } finally {
      setLoading(false);
    }
  };


  return { deviceActivation, uploadJsonFile, fetchTreeData, loading };
}

