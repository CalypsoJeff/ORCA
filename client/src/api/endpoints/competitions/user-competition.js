import END_POINTS from "../../../constants/endpoints";
import { load_Competition, load_Competition_Details, load_Payment_Details, register_Competition } from "../../services/competitions/user-competition-service";

export const fetchCompetitions = () => {
    return load_Competition(END_POINTS.LOAD_USER_COMPETITIONS);
}
export const fetchCompetitionDetails = (id) => {
    return load_Competition_Details(END_POINTS.LOAD_USER_COMPETITION_DETAILS, id);
}
export const registerCompetition = (data) => {
    return register_Competition(END_POINTS.REGISTER_COMPETITION, data);
}
export const fetchPaymentDetails = (id) => {
    return load_Payment_Details(END_POINTS.Fetch_Payment_Details, id);
}
