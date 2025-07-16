import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
const collection = 'Users';


const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    posizione: { type: Boolean, required: false, default: false },
    status: { type: String, enum: ['active', 'suspended'], default: 'active' }, 
    segnalazioni: [{ type: mongoose.Schema.Types.ObjectId, ref: "Report", default: [] }], 
}, {
    timestamps: true,
});


UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
  
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      next();
    } catch (err) { next(err); } 
});


UserSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};


UserSchema.methods.generateAuthToken = function () {
    const payload = { _id: this._id, email: this.email, username: this.username, accountType: 'user' };
  
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h'});
  
    return token;
};


export default mongoose.model(collection, UserSchema);