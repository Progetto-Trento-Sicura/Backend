import User from '../models/UserModel.js';
import Report from '../models/ReportModel.js';
import Org from '../models/OrgModel.js';


export const register = async (req, res) => {
    try {
      const { username, email, password, phone, indirizzo, descrizione } = req.body;
  
      console.log('Received:', { email, username, password, phone, indirizzo, descrizione });
  
      const existingemail = await Org.findOne({ email });
      const existingUsername = await Org.findOne({ username });
      if (existingUsername || existingemail) {
        return res.status(400).json({ message: 'User already exists' });
      }
  
      if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
      }
      if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/.test(password)) {
        return res.status(400).json({ message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' });
      }
      const newOrg = new Org({ email, username, password, phone, indirizzo, descrizione });
      await newOrg.save();
  
      return res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
    console.error('Registration error:', error); 
    return res.status(500).json({ message: 'Server error', error: error.message || error });
}
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const org = await Org.findOne({ email });
    if (!org) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await org.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = org.generateAuthToken();

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'Strict', 
      maxAge: 3600000, 
    });

    // Aggiungi il token nella risposta
    return res.status(200).json({ message: 'Logged in successfully', org, token });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error', error });
  }
};


export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-password'); // Esclude la password

    return res.status(200).json({ users });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Failed to fetch users', error });
  }
};

export const editOrg = async (req, res) => { 
  try {
    const { id } = req.params;  
    const loggedInOrgId = req.user._id.toString();
    const { email, username, password, phone, indirizzo, descrizione } = req.body;

    if (id !== loggedInOrgId) {
      return res.status(403).json({ message: "You cannot edit another user's account." });
    }

    const org = await Org.findById(id);
    if (!org) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (email) org.email = email;
    if (username) org.username = username;
    if (password) org.password = password;
    if (phone) org.phone = phone;
    if (indirizzo) org.indirizzo = indirizzo;
    if (descrizione) org.descrizione = descrizione;

    await org.save();

    return res.status(200).json({ message: 'User updated successfully', organization: org });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
};

//modificare e cancellare tutti i report indipendentemente dall'owner

export const deleteReport = async (req, res) => {
  try {
    const { reportId } = req.params;

    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    await Report.findByIdAndDelete(reportId);

    return res.status(200).json({ message: 'Report deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
};

export const updateReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { reportData } = req.body;

    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    Object.assign(report, reportData);
    await report.save();

    return res.status(200).json({ message: 'Report updated successfully', report });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
};

export const deleteOrg = async (req, res) => {
  try {
    const { id } = req.params;
    const loggedInOrgId = req.user._id.toString();

    if (id !== loggedInOrgId) {
      return res.status(403).json({ message: "You cannot delete another user's account." });
    }

    const org = await Org.findById(id);
    if (!org) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    await Org.findByIdAndDelete(id);

    return res.status(200).json({ message: 'Organization deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Elimina anche tutte le segnalazioni dell'utente
    await Report.deleteMany({ user: userId });
    await User.findByIdAndDelete(userId);

    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({ message: 'Server error', error });
  }
};

export const suspendUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.status = 'suspended';
    await user.save();

    return res.status(200).json({ message: 'User suspended successfully' });
  } catch (error) {
    console.error('Suspend user error:', error);
    return res.status(500).json({ message: 'Server error', error });
  }
};

export const reactivateUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.status = 'active';
    await user.save();

    return res.status(200).json({ message: 'User reactivated successfully' });
  } catch (error) {
    console.error('Reactivate user error:', error);
    return res.status(500).json({ message: 'Server error', error });
  }
};
