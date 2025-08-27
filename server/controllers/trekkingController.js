import { uploadToCloudinary } from '../helper/uploadToCloudinary.js';
import Trekking from '../models/trekkingModel.js';

const loadTrekkingPage = async (req, res) => {
    try {
        const trekList = await Trekking.find().sort({ startDate: 1 });
        return res.status(200).json({
            message: trekList.length ? "Trekking events loaded successfully." : "No trekking events found.",
            trekList,
        });
    } catch (error) {
        console.error("Error loading trekking events:", error);
        return res.status(500).json({ message: "Failed to load trekking events.", error: error.message });
    }
};
const addTrekking = async (req, res) => {
    try {
        const { name, category, trekDistance, trekDuration, costPerPerson, startDate, difficulty, maxParticipants, place, state, district, description } = req.body;
        if (!req.file) {
            return res.status(400).json({ message: "Image is required." });
        }
        const { secure_url } = await uploadToCloudinary(req.file);
        const trekkingEvent = new Trekking({ name, category, image: secure_url, trekDistance, trekDuration, costPerPerson, startDate, difficulty, maxParticipants, place, state, district, description });
        await trekkingEvent.save();
        return res.status(200).json({ message: "Trekking event added successfully.", trekkingEvent });
    } catch (error) {
        console.error("Error adding trekking event:", error);
        return res.status(500).json({ message: "Failed to add trekking event.", error: error.message });
    }
};




const editTrekking = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, category, image, trekDistance, trekDuration, costPerPerson, startDate, difficulty, maxParticipants, place, state, district, description } = req.body;
        const updatedTrekking = await Trekking.findByIdAndUpdate(id, { name, category, image, trekDistance, trekDuration, costPerPerson, startDate, difficulty, maxParticipants, place, state, district, description }, { new: true, runValidators: true });
        if (!updatedTrekking) {
            return res.status(404).json({ message: "Trekking event not found." });
        }
        return res.status(200).json({ message: "Trekking event updated successfully.", trekkingEvent: updatedTrekking });
    } catch (error) {
        console.error("Error editing trekking event:", error);
        return res.status(500).json({ message: "Failed to edit trekking event.", error: error.message });
    }
};

// Delete Trekking Event
const deleteTrekking = async (req, res) => {
    try {
        const { id } = req.params;
        const trekkingEvent = await Trekking.findByIdAndDelete(id);
        if (!trekkingEvent) {
            return res.status(404).json({ message: "Trekking event not found." });
        }
        return res.status(200).json({ message: "Trekking event deleted successfully." });
    } catch (error) {
        console.error("Error deleting trekking event:", error);
        return res.status(500).json({ message: "Failed to delete trekking event.", error: error.message });
    }
};

export default {
    loadTrekkingPage,
    addTrekking,
    editTrekking,
    deleteTrekking
}