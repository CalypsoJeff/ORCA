import CONFIG_KEYS from "../../../config";
import authInstanceAxios from "../../middlewares/interceptor";

export const load_Competition = async (endpoint) => {
    try {
        const response = await authInstanceAxios.get(
            `${CONFIG_KEYS.API_BASE_URL}/${endpoint}`,
        );
        return response;
    } catch (error) {
        console.error("Error fetching competitions:", error);
        throw error;
    }
}

export const load_Competition_Details = async (endpoint, id) => {
    try {
        const response = await authInstanceAxios.get(
            `${CONFIG_KEYS.API_BASE_URL}/${endpoint}/${id}`,
        );
        return response;
    } catch (error) {
        console.error("Error fetching competition details:", error);
        throw error;
    }
}
export const register_Competition = async (endpoint, data) => {
    try {
        const response = await authInstanceAxios.post(
            `${CONFIG_KEYS.API_BASE_URL}/${endpoint}`,
            data
        );
        return response;
    } catch (error) {
        console.error("Error registering competition:", error);
        throw error;
    }
}
export const    load_Payment_Details = async (endpoint, id) => {
    try {
        const response = await authInstanceAxios.get(
            `${CONFIG_KEYS.API_BASE_URL}/${endpoint}/${id}`,
        );
        return response;
    } catch (error) {
        console.error("Error fetching payment details:", error);
        throw error;
    }
}