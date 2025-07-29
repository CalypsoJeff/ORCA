import Competition from '../models/competitionsModel.js';

const loadCompetitionsPage = async (req, res) => {
    try {
        const competitions = await Competition.find().sort({ date: -1 });
        if (!competitions || competitions.length === 0) {
            return res.status(200).json({
                message: "No competitions found.",
                competitions: [],
            });
        }
        return res.status(200).json({
            message: "Competitions loaded successfully.",
            competitions,
        });
    } catch (error) {
        console.error("Error loading competitions:", error);
        return res.status(500).json({
            message: "Failed to load competitions.",
            error: error.message,
        });
    }
};

const addCompetition = async (req, res) => {
    try {
        const {
            name,
            category,
            time,
            date,
            place,
            state,
            district,
            town,
            duration,
            type,
            cost,
            maxRegistrations,
            description,
            status,
        } = req.body;
        if (!req.files || req.files.length === 0) {
            console.error("❌ Competition Image is missing.");
            return res.status(400).json({ message: "Competition Image is required." });
        }
        const { Location } = await uploadToS3(req.files[0]);
        const competition = new Competition({
            name,
            category,
            image: [Location],
            time,
            date,
            place,
            state,
            district,
            town,
            duration,
            type,
            cost,
            maxRegistrations,
            description,
            status: status || 'inactive',
        });
        await competition.save();
        return res.status(200).json({
            message: 'Competition added successfully.',
            competition,
        });
    } catch (error) {
        console.error('Error adding competition:', error);
        return res.status(500).json({
            message: 'Failed to add competition.',
            error: error.message,
        });
    }
};
const editCompetition = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            category,
            time,
            date,
            place,
            state,
            district,
            town,
            duration,
            type,
            cost,
            maxRegistrations,
            description,
            status,
        } = req.body;
        if (!req.files || req.files.length === 0) {
            console.error("❌ Competition Image is missing.");
            return res.status(400).json({ message: "Competition Image is required." });
        }
        const { Location } = await uploadToS3(req.files[0]);
        const existingCompetition = await Competition.findById(id);
        if (!existingCompetition) {
            return res.status(404).json({
                message: 'Competition not found.',
            });
        }
        const updatedCompetition = await Competition.findByIdAndUpdate(
            id,
            {
                name: name || existingCompetition.name,
                category: category || existingCompetition.category,
                image: [Location] || existingCompetition.image,
                time: time || existingCompetition.time,
                date: date || existingCompetition.date,
                place: place || existingCompetition.place,
                state: state || existingCompetition.state,
                district: district || existingCompetition.district,
                town: town || existingCompetition.town,
                duration: duration || existingCompetition.duration,
                type: type || existingCompetition.type,
                cost: cost || existingCompetition.cost,
                maxRegistrations: maxRegistrations || existingCompetition.maxRegistrations,
                description: description || existingCompetition.description,
                status: status || existingCompetition.status,
            },
            { new: true, runValidators: true }
        );
        return res.status(200).json({
            message: 'Competition updated successfully.',
            competition: updatedCompetition,
        });
    } catch (error) {
        console.error('Error editing competition:', error);
        return res.status(500).json({
            message: 'Failed to edit competition.',
            error: error.message,
        });
    }
};
const deleteCompetition = async (req, res) => {
    try {
        const { id } = req.params;
        const competition = await Competition.findByIdAndDelete(id);
        if (!competition) {
            return res.status(404).json({
                message: 'Competition not found.',
            });
        }
        return res.status(200).json({
            message: 'Competition deleted successfully.',
        });
    } catch (error) {
        console.error('Error deleting competition:', error);
        return res.status(500).json({
            message: 'Failed to delete competition.',
            error: error.message,
        });
    }
};

export default {
    loadCompetitionsPage,
    deleteCompetition,
    addCompetition,
    editCompetition,
}