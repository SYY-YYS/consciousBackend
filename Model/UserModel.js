import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            
        },
        email : {
            type: String,
            required: true,
            unique: true
        },
        // any ToDo
        // ToDo : {
        //     date: time_spent
        // }, 
    },
    { strict: false }
);

export default mongoose.model('consciousData', UserSchema);