import express from 'express';
import usersRoutes from './routes/UserRoutes.js';
import reportsRoutes from './routes/ReportRoutes.js';
import orgsRoutes from './routes/OrgRoutes.js';
import { mongoConnect } from './utils/db.js';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

dotenv.config();


const PORT = process.env.PORT
const app = express();
app.use(express.json());
app.use(cookieParser());


app.use(cors({
  origin: [
    'http://localhost:8080', // per sviluppo locale
    'https://frontend-cb2s.onrender.com' // per deploy su render
  ],
  credentials: true
}));

mongoConnect();

const swaggerDocument = YAML.load('./api-docs.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


app.use("/api/users", usersRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/orgs", orgsRoutes);


export default app;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
