const mongoose = require("mongoose");

async function DB() {
  mongoose.connect("mongodb+srv://happydream9032:rkgjdtmd2304@cluster0.psm1fem.mongodb.net/?retryWrites=true&w=majority");
  const connection = mongoose.connection;

  connection.once("connected", () => {
    console.info("Mongoose Connected ");
  });

  connection.on("error", (err) => {
    console.error(`Mongoose Connection Error: ${err.message}`);
  });

  connection.on("disconnected", () => {
    console.log("Mongoose Disconnected");
  });
}

module.exports = DB;
