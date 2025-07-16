import User from '../models/UserModel.js';
import Report from '../models/ReportModel.js';
import Org from '../models/OrgModel.js';


export const createReport = async (req, res) => {
  try {
    const { reportData } = req.body;
    const { _id: userId, accountType } = req.user;

    const newReport = new Report({ user: userId, ...reportData });
    await newReport.save();

    const Model = accountType === 'org' ? Org : User;

    const updated = await Model.findByIdAndUpdate(
      userId,
      { $push: { segnalazioni: newReport._id } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: `${accountType} not found` });
    }

    return res.status(201).json({ message: 'Report created successfully', report: newReport });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
};

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

export const getReport = async (req, res) => {
  try {
    const { reportId } = req.params;

    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Aggiungi la stessa logica di getAllReports per popolare i dati dell'account
    let accountInfo = null;
    
    // Prima prova come utente
    const user = await User.findById(report.user);
    if (user) {
      accountInfo = { 
        username: user.username, 
        accountType: 'user',
        phone: user.phone
      };
    } else {
      // Se non è un utente, prova come organizzazione
      const org = await Org.findById(report.user);
      if (org) {
        accountInfo = { name: org.username, accountType: 'org' };
      }
    }
    
    const reportWithAccountInfo = {
      ...report.toObject(),
      user: accountInfo?.username || null,
      userPhone: accountInfo?.phone || null,
      organization: accountInfo?.accountType === 'org' ? { name: accountInfo.name } : null
    };

    return res.status(200).json(reportWithAccountInfo);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
};

export const getAllReports = async (req, res) => {
  try {   
    // Ottieni tutti i report senza filtrare per tipo di account
    const reports = await Report.find({});
    
    // if (!reports || reports.length === 0) {
    //   return res.status(404).json({ message: 'No reports found' });
    // }

    // Per ogni report, determina se è di un utente o organizzazione
    const reportsWithAccountInfo = await Promise.all(
      reports.map(async (report) => {
        let accountInfo = null;
        
        // Prima prova a cercare come utente
        const user = await User.findById(report.user);
        if (user) {
          // Includi le informazioni del telefono
          accountInfo = { 
            username: user.username, 
            accountType: 'user',
            phone: user.phone // Aggiungi il campo phone
          };
        } else {
          // Se non è un utente, prova come organizzazione
          const org = await Org.findById(report.user);
          if (org) {
            accountInfo = { name: org.username, accountType: 'org' };
          }
        }
        
        return {
          ...report.toObject(),
          user: accountInfo?.username || null,
          userPhone: accountInfo?.phone || null, // Aggiungi il campo userPhone
          organization: accountInfo?.accountType === 'org' ? { name: accountInfo.name } : null
        };
      })
    );

    return res.status(200).json(reportsWithAccountInfo);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
};

export const updateReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { reportData } = req.body;
    const { _id: userId } = req.user;

    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Verifica che l'utente possa modificare solo le proprie segnalazioni
    if (report.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'You can only edit your own reports' });
    }

    Object.assign(report, reportData);
    await report.save();

    return res.status(200).json({ message: 'Report updated successfully', report });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
};

// Nuova API per il pannello controllo - solo segnalazioni utenti
export const getUserOnlyReports = async (req, res) => {
  try {   
    const users = await User.find({}, '_id username');
    const userMap = new Map(users.map(user => [user._id.toString(), user.username]));
    
    const reports = await Report.find({ 
      user: { $in: users.map(u => u._id) } 
    }).lean();
    
    // Aggiungi manualmente il nome utente
    const reportsWithUser = reports.map(report => ({
      ...report,
      user: {
        _id: report.user,
        username: userMap.get(report.user.toString()) || 'Utente sconosciuto'
      }
    }));
    
    return res.status(200).json(reportsWithUser);
  } catch (error) {
    console.error('Errore in getUserOnlyReports:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Nuovo metodo per ottenere le segnalazioni dell'utente corrente
export const getMyReports = async (req, res) => {
  try {
    const { _id: userId } = req.user;
    
    const reports = await Report.find({ user: userId })
      .sort({ createdAt: -1 })  // Ordina per data più recente
      .lean();
    
    return res.status(200).json(reports);
  } catch (error) {
    console.error('Errore in getMyReports:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
