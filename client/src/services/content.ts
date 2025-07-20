import toast from "react-hot-toast";
import axiosInstance from "../config/axiosConfig";
import { errorToastOptions, successToastOptions } from "../types";

export const fetchUserRelatedContent = async () => {
    try {
        const response = await axiosInstance.get('/user/content');

        if(response.status !== 200){
            toast.error('Failed to fetch content', errorToastOptions);
            throw new Error('Failed to fetch app content')
        }
        const data = response.data;
        toast.success(data!.message, successToastOptions)
        return data;
    } catch (error) {
        console.error("Error fetching app content: ", error)
    }
}