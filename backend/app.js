import express from 'express';
import cors from 'cors';
import { connectDB } from './DB/Database.js';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import transactionRoutes from './Routers/Transactions.js';
import userRoutes from './Routers/userRouter.js';
import categoryRouter from "./Routers/categoryRouter.js";
import tripRouter from "./Routers/tripRouter.js";

const app = express();

const port = 8080;

connectDB();
const allowedOrigins = [
  "http://localhost:3000",
];
console.log("sattt", allowedOrigins)

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  })
);
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Router
app.use('/api/v1', transactionRoutes);
app.use('/api/auth', userRoutes);
app.use('/api/categories', categoryRouter);
app.use('/api/trips', tripRouter);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}`);
});
