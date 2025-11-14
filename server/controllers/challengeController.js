import Challenge from "../models/challengeModel.js";

/* ------------------------------------------
   CREATE CHALLENGE
-------------------------------------------*/
export const createChallenge = async (req, res) => {
    try {
        const gymOwnerId = req.gymOwnerId;
        const challenge = await Challenge.create({ ...req.body, gymOwnerId });

        res.status(201).json({
            message: "Challenge created successfully",
            challenge
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/* ------------------------------------------
   GET ALL CHALLENGES
-------------------------------------------*/
export const getChallenges = async (req, res) => {
    try {
        const gymOwnerId = req.gymOwnerId;
        const challenges = await Challenge.find({ gymOwnerId })
            .populate("exercises");

        res.json(challenges);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/* ------------------------------------------
   GET SINGLE CHALLENGE
-------------------------------------------*/
export const getChallengeById = async (req, res) => {
    try {
        const { id } = req.params;

        const challenge = await Challenge.findOne({
            _id: id,
            gymOwnerId: req.gymOwnerId
        }).populate("exercises");

        if (!challenge)
            return res.status(404).json({ message: "Challenge not found" });

        res.json(challenge);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/* ------------------------------------------
   UPDATE CHALLENGE
-------------------------------------------*/
export const updateChallenge = async (req, res) => {
    try {
        const { id } = req.params;

        const updated = await Challenge.findOneAndUpdate(
            { _id: id, gymOwnerId: req.gymOwnerId },
            req.body,
            { new: true }
        );

        if (!updated)
            return res.status(404).json({
                message: "Challenge not found or unauthorized"
            });

        res.json({
            message: "Challenge updated successfully",
            challenge: updated
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/* ------------------------------------------
   DELETE CHALLENGE
-------------------------------------------*/
export const deleteChallenge = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await Challenge.findOneAndDelete({
            _id: id,
            gymOwnerId: req.gymOwnerId
        });

        if (!deleted)
            return res.status(404).json({
                message: "Challenge not found or unauthorized"
            });

        res.json({ message: "Challenge deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
