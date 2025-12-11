// migrate-mongo configuration
const config = {
  mongodb: {
    url: process.env.MONGODB_URI || 'mongodb://localhost:27017/asceta_mongodb',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  migrationsDir: 'src/migrations/mongodb',
  changelogCollectionName: 'migrations',
  migrationFileExtension: '.js',
  useFileHash: false,
};

module.exports = config;

