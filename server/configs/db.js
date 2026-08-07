import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => {
      console.log("Database connected Successfully!");
    });

    let mongodbURI = process.env.MONGODB_URI;
    const projectName = "ResumeBuilder";

    if (!mongodbURI) {
      console.error(
        "MONGODB_URI environment variable not set. Please check your .env file."
      );
      process.exit(1);
    }

    let connectionString;
    const queryIndex = mongodbURI.indexOf("?");
    if (queryIndex !== -1) {
      const base = mongodbURI.slice(0, queryIndex);
      const query = mongodbURI.slice(queryIndex);
      const cleanBase = base.endsWith("/") ? base.slice(0, -1) : base;
      connectionString = `${cleanBase}/${projectName}${query}`;
    } else {
      const cleanURI = mongodbURI.endsWith("/") ? mongodbURI.slice(0, -1) : mongodbURI;
      connectionString = `${cleanURI}/${projectName}`;
    }

    await mongoose.connect(connectionString);
  } catch (error) {
    console.error(
      "Connection Failed!, Error while connecting to MongoDB:",
      error.message || error
    );

    process.exit(1);
  }
};

export default connectDB;
