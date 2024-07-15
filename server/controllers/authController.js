const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const uuid = require("uuid");
const path = require("path");

exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        console.log(req.body)
        let fileName = "default.jpg";
        console.log(req.files)
        if (req.files && req.files.image) {
            const image = req.files.image;
            fileName = uuid.v4() + ".jpg";
            await image.mv(path.resolve(__dirname, "..", "static", fileName));
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await User.create({ 
            username,
            email, 
            password: hashedPassword,
            image: fileName
        });
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const token = jwt.sign({ userId: user.id }, 'allvision', { expiresIn: '7d' });
        res.status(200).json({token});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
