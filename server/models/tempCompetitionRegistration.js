import mongoose from "mongoose";

const tempRegSchema = new mongoose.Schema({
    userId: String,
    competitionId: String,
    name: String,
    email: String,
    phone: String,

    createdAt: { type: Date, default: Date.now, expires: 600 } // auto delete after 10 min
});

export default mongoose.model("TempCompetitionRegistration", tempRegSchema);
