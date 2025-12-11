import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectMongoDB, getMongoDBStatus } from './config/mongodb';
import authRoutes from './routes/auth.routes';
import newsRoutes from './routes/news.routes';
import eventsRoutes from './routes/events.routes';
import pagesRoutes from './routes/pages.routes';
import accaddRoutes from './routes/accadd.routes';
import admissionRoutes from './routes/admission.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const corsOptions = {
  origin: [
    process.env.FRONTEND_MAIN_URL || 'http://localhost:3000',
    process.env.FRONTEND_ADMIN_URL || 'http://localhost:3001',
  ],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/pages', pagesRoutes);
app.use('/api/accadd', accaddRoutes);
app.use('/api/admission', admissionRoutes);

// Health check with database status
app.get('/api/health', (req, res) => {
  const mongoStatus = getMongoDBStatus();
  
  res.status(mongoStatus.connected ? 200 : 503).json({
    status: mongoStatus.connected ? 'ok' : 'degraded',
    message: 'ASCETA API is running',
    database: {
      mongodb: {
        connected: mongoStatus.connected,
        error: mongoStatus.error,
        readyState: mongoStatus.readyState, // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
      },
    },
  });
});

// Initialize MongoDB connection
async function initializeDatabase() {
  try {
    await connectMongoDB();
    const status = getMongoDBStatus();
    
    if (status.connected) {
      console.log('✅ MongoDB connected successfully');
    } else {
      console.error('❌ MongoDB connection failed:', status.error);
      console.warn('⚠️  Server will start, but features requiring MongoDB may not work.');
    }
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    console.warn('⚠️  Server will start, but features requiring MongoDB may not work.');
  }

  // Start server
  app.listen(PORT, () => {
    console.log(`\n🚀 Server is running on port ${PORT}`);
    console.log(`📊 Health check available at http://localhost:${PORT}/api/health\n`);
  });
}

// Start the server
initializeDatabase();

export default app;

