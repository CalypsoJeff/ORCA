import Challenge from "../models/challengeModel.js";

export const createChallenge = async (req, res) => {
    try {
        const gymOwnerId = req.gymOwnerId;
        const challenge = await Challenge.create({ ...req.body, gymOwnerId });
        res.status(201).json({ message: "Challenge created successfully", challenge });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getChallenges = async (req, res) => {
    try {
        const gymOwnerId = req.gymOwnerId;
        const challenges = await Challenge.find({ gymOwnerId }).populate("exercises");
        res.json(challenges);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const deleteChallenge = async (req, res) => {
    try {
        const { id } = req.params;
        await Challenge.findByIdAndDelete(id);
        res.json({ message: "Challenge deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
