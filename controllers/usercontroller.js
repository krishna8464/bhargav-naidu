const fs = require("fs/promises");
const bcrypt = require('bcrypt');
const userFilePath = 'user.json';
const jwt = require('jsonwebtoken');

const secretKey  = "User"


// Helper functions to read and write users to the file
async function readUsers() {
    try {
      const data = await fs.readFile(userFilePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      // If the file doesn't exist, return an empty array
      if (error.code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  // rewriting the file
async function writeUsers(users) {
   await fs.writeFile(userFilePath, JSON.stringify(users, null, 2), 'utf8');
};

exports.registerUser = async(req , res ) => {
    let userData = req.body;
    try {
       // Validate data
    if (!userData.name || !userData.number || !userData.email || !userData.password) {
        return res.status(400).json({ error: 'Invalid data. Please provide all required fields.' });
      }

    // Check if user already exists
    const users = await readUsers();
    if (users.find(user => user.email === userData.email)) {
      return res.status(409).json({ error: 'User already exists.' });
    };

    // Hash the password
    const hashedPassword = await bcrypt.hash(userData.password,10);
    userData.password = hashedPassword;

    // Save data to user.json
    users.push(userData);
    await writeUsers(users);

    res.status(201).json({ message: 'User registered successfully.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error.' });
    }
};

exports.getusers = async ( req , res ) => {
    try {
    const users = await readUsers();
    res.status(200).send(users)
    } catch (error) {
        res.status(400).send("server is not working")
    }
};

exports.userLogin = async ( req , res ) => {
    const { email, password } = req.body;
    try {
        // Validate data
    if (!email || !password) {
        return res.status(400).json({ error: 'Invalid data. Please provide email and password.' });
      };

      // Check if user exists
    const users = await readUsers();
    const user = users.find(user => user.email === email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Invalid credentials. Please check your email and password.' });
      };

    // Generate JWT token
    const token = jwt.sign({ email: user.email }, secretKey, { expiresIn: '1h' });
    res.status(200).json({
        message: 'Login successful.',
        token,
        user: {
          name: user.name,
          email: user.email,
          number: user.number,
        },
      });
        
    } catch (errorr) {
        res.status(500).json({ error: 'Internal Server Error.' });
    }
}
 