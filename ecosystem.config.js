module.exports = {
    apps: [
      {
        name: "express-local",
        script: "node index.js",
        env: {
          MONGO_URI: "mongodb://admin:securepassword@54.173.132.195:27017/admin",
          PORT: 5000
        }
      },
      {
        name: "express-cloud",
        script: "node index.js",
        env: {
          MONGO_URI: "mongodb://admin:securepassword@54.173.132.195:27017/admin",
          PORT: 3000
        }
      }
    ]
  };
  