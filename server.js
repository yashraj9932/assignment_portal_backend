const express = require("express");
const path = require("path");
const cors = require("cors");

const colors = require("colors");
const dotenv = require("dotenv");
const fileupload = require("express-fileupload");

const connectDB = require("./config/db");
const errorHandler = require("./middleware/error");

//Saare middlewares ko server file mai laake run karna kripya na bhoolein

const app = express();

//Load environment Variables and also specify that path to the config file
dotenv.config({ path: "./config/config.env" });

connectDB();

// CORS configuration
app.use(cors({
  origin: ['http://localhost:4200', 'http://localhost:3000'], // Allow Angular dev server
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));

const student = require("./routes/student");
const teacher = require("./routes/teacher");
const assignment = require("./routes/assigment");

app.use(express.json());

app.use(fileupload());

app.use(express.static(path.join(__dirname, "public")));

// Favicon route to prevent 500 errors
app.get('/favicon.ico', (req, res) => {
  res.status(204).end(); // No content response
});

app.use("/student", student);
app.use("/teacher", teacher);
app.use("/assignment", assignment);

//This middleware to be always used at the last.
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  );
});

//Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  //Close the server and exit the process
  server.close(() => process.exit(1));
});
