const express = require('express');
const fs = require("fs/promises");
const bcrypt = require('bcrypt');
const app = express();
const port = 3000;

const { registerUser , getusers , userLogin } = require("./controllers/usercontroller")

app.use(express.json());

app.get('/', (req, res) => {
  try {
    res.status(200).send("Welcom To User Mangement")
  } catch (error) {
    res.status(400).send("Sorry the server has stoped")
  }
});

app.post("/register" , registerUser );
app.get("/getusers" , getusers);
app.post("/login" , userLogin)



app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
