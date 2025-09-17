import express from 'express';
import dotenv from 'dotenv';
import Routes from './routes/index.routes';
import cors from 'cors';
import cookieParser from 'cookie-parser';


dotenv.config();
const app = express();

app.use(cookieParser());
app.use(cors());
// app.use(cors({
//     origin: 'http://localhost:5000',  
//     credentials: true                 
// }));

app.use(express.json());

/**All API routes */
app.use('/api', Routes);

export default app;



