import User from '../models/UserModel.js';
import Report from '../models/ReportModel.js';

export const register = async (req, res) => {
    try {
      const { email, username, password, posizione } = req.body;

      console.log('Received:', { email, username, password, posizione });
  
      const existingemail = await User.findOne({ email });
      const existingUsername = await User.findOne({ username });
      if (existingUsername || existingemail) {
        return res.status(400).json({ message: 'User already exists' });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
      }
      if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/.test(password)) {
        return res.status(400).json({ message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' });
      }
      const newUser = new User({ email, username, password, posizione });
      await newUser.save();
  
      return res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error });
    }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Controllo se l'utente è sospeso
    if (user.status === 'suspended') {
      return res.status(403).json({ message: 'Account sospeso. Contatta l\'amministratore.' });
    }

    const token = user.generateAuthToken();

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'Strict', 
      maxAge: 3600000, 
    });

    return res.status(200).json({ message: 'Logged in successfully', user, token });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
};


export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;  
    const loggedInUserId = req.user._id.toString(); 

    if (id !== loggedInUserId) {
      return res.status(403).json({ message: "You cannot delete another user's account." });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Elimina prima tutte le segnalazioni dell'utente
    await Report.deleteMany({ user: id });
    
    // Poi elimina l'utente
    await User.findByIdAndDelete(id);  

    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({ message: 'Server error', error });
  }
};

export const editUser = async (req, res) => { 
  try {
    const { id } = req.params;  
    const loggedInUserId = req.user._id.toString();
    const { email, username, password } = req.body;

    if (id !== loggedInUserId) {
      return res.status(403).json({ message: "You cannot edit another user's account." });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (email) user.email = email;
    if (username) user.username = username;
    if (password) user.password = password;

    await user.save();

    return res.status(200).json({ message: 'User updated successfully', user });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
};
