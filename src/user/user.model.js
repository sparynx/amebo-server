const mongoose = require("mongoose");
const bcrypt = require("bcrypt");


const userSchema = new mongoose.Schema({
    username: {
        type: 'string',
        required: true,
        unique: true
    },
    password: {
        type: 'string',
        required: true
    },
    role: {
        type: 'string',
        enum: ["user", "admin"],
        required: true
    }
})  

userSchema.pre("save", async function(next) {
    if(!this.isModified("password")) return  next();
    this.password = await bcrypt.hash(this.password , 10);
    next();
})

const User = mongoose.model("User", userSchema);

module.exports = User;