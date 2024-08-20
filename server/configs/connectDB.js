const mongoose = require("mongoose");

const uri = `mongodb+srv://sitranvan:tranvansi@stvcluster.hezg5zc.mongodb.net/?retryWrites=true&w=majority&appName=STVCluster`;

const connectToDatabase = async () => {
  try {
    await mongoose.connect(uri, {
      dbName: "test_grpc",
    });
    console.log("Connected to the database successfully!");
  } catch (error) {
    console.error("Failed to connect to the database:", error);
  }
};

module.exports = connectToDatabase;
