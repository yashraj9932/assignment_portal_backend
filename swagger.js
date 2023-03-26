const swaggerAutogen = require("swagger-autogen")();

const doc = {
  info: {
    title: "API for Assigment Portal",
    description:
      "This is the documentation for the assignment portal API, there is some issue with all the APIs not showing up and will be resolved soon.",
  },
  host: "localhost:3000",
  schemes: ["http"],
  tags: [
    {
      name: "Assignment",
      description:
        "This is the endpoint for all things related to assignments directly.",
    },
    {
      name: "Teacher / Student",
      description:
        "This is the endpoint for all things related to teachers / students directly.",
    },
  ],
};

const outputFile = "./swagger_output.json";
const endpointsFiles = [
  "./routes/assigment.js",
  "./routes/student.js",
  "./routes/teacher.js",
];

swaggerAutogen(outputFile, endpointsFiles, doc);
