import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
const collection = 'Orgs'; 

const OrgSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: Number, required: true, unique: true },
    indirizzo: { type: String, required: true },
    descrizione: { type: String, required: true }, 
    segnalazioni: [{ type: mongoose.Schema.Types.ObjectId, ref: "Report", default: [] }], 
}, {
    timestamps: true,
});

OrgSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
  
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      next();
    } catch (err) { next(err); } 
});


OrgSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};


OrgSchema.methods.generateAuthToken = function () {
    const payload = { 
        _id: this._id, 
        email: this.email, 
        username: this.username, 
        accountType: 'org' 
    };
  
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h'});
  
    return token;
};

export default mongoose.model(collection, OrgSchema);