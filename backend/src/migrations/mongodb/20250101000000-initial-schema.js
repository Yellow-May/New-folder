/**
 * Initial schema migration
 * Creates indexes for all collections
 */
module.exports = {
  async up(db, client) {
    console.log("Running initial schema migration...");

    // Create indexes for users collection
    const usersCollection = db.collection("users");
    await usersCollection.createIndex({ email: 1 }, { unique: true });
    await usersCollection.createIndex({ studentId: 1 });
    await usersCollection.createIndex({ staffId: 1 });
    await usersCollection.createIndex({ role: 1 });
    console.log("✅ Created indexes for users collection");

    // Create indexes for accadd-users collection
    const accaddUsersCollection = db.collection("accadd-users");
    await accaddUsersCollection.createIndex({ email: 1 }, { unique: true });
    await accaddUsersCollection.createIndex(
      { supabaseUserId: 1 },
      { unique: true }
    );
    console.log("✅ Created indexes for accadd-users collection");

    // Create indexes for news collection
    const newsCollection = db.collection("news");
    await newsCollection.createIndex({ authorId: 1 });
    await newsCollection.createIndex({ status: 1 });
    await newsCollection.createIndex({ createdAt: -1 });
    await newsCollection.createIndex({ title: "text" });
    console.log("✅ Created indexes for news collection");

    // Create indexes for events collection
    const eventsCollection = db.collection("events");
    await eventsCollection.createIndex({ createdById: 1 });
    await eventsCollection.createIndex({ eventDate: 1 });
    await eventsCollection.createIndex({ title: "text" });
    console.log("✅ Created indexes for events collection");

    // Create indexes for pages collection
    const pagesCollection = db.collection("pages");
    await pagesCollection.createIndex({ slug: 1 }, { unique: true });
    await pagesCollection.createIndex({ title: "text" });
    console.log("✅ Created indexes for pages collection");

    console.log("✅ Initial schema migration completed");
  },

  async down(db, client) {
    console.log("Reverting initial schema migration...");

    // Drop indexes (MongoDB will handle gracefully if indexes don't exist)
    try {
      await db.collection("users").dropIndexes();
      await db.collection("accadd-users").dropIndexes();
      await db.collection("news").dropIndexes();
      await db.collection("events").dropIndexes();
      await db.collection("pages").dropIndexes();
      console.log("✅ Dropped indexes");
    } catch (error) {
      console.warn(
        "⚠️  Error dropping indexes (may not exist):",
        error.message
      );
    }
  },
};
