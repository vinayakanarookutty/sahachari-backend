module.exports = {
    apps: [
      {
        name: "express-local",
        script: "node index.js",
        env: {
          MONGO_URI: "mongodb+srv://Dilshad:dilshad1041@cluster0.mcgvrw2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
          PORT: 5000
        }
      },
      {
        name: "express-cloud",
        script: "node index.js",
        env: {
          MONGO_URI: "mongodb+srv://Dilshad:dilshad1041@cluster0.mcgvrw2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
          PORT: 3000
        }
      }
    ]
  };
  