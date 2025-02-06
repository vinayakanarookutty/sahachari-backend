module.exports = {
    apps: [
      {
        name: "express-local",
        script: "server.js",
        env: {
          MONGO_URI: "mongodb+srv://Dilshad:dilshad1041@cluster0.mcgvrw2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
          PORT: 5000
        }
      },
      {
        name: "express-cloud",
        script: "server.js",
        env: {
          MONGO_URI: "mongodb://admin:securepassword@54.173.132.195:27017/admin",
          PORT: 3000
        }
      }
    ]
  };
  