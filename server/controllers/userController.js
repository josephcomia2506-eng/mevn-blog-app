const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    try {
        const { email, username, password } = req.body;

        if (!email || !username || !password) {
            return res.status(400).json({
                message: 'Email, username, and password are required.'
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: 'Password must contain at least 8 characters.'
            });
        }

        const existingUser = await User.findOne({
            $or: [
                { email: email.toLowerCase().trim() },
                { username: username.trim() }
            ]
        });

        if (existingUser) {
            return res.status(409).json({
                message: 'Email or username is already registered.'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            email,
            username,
            password: hashedPassword
        });

        return res.status(201).json({
            message: 'Registration successful.',
            user: {
                id: newUser._id,
                email: newUser.email,
                username: newUser.username,
                isAdmin: newUser.isAdmin
            }
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: 'Registration failed.'
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: 'Email and password are required.'
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase().trim()
        });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({
                message: 'Invalid email or password.'
            });
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        return res.status(200).json({
            message: 'Login successful.',
            token,
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                isAdmin: user.isAdmin
            }
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: 'Login failed.'
        });
    }
};

const createAdmin = async (req, res) => {
    try {
        const email = process.env.ADMIN_EMAIL;
        const username = process.env.ADMIN_USERNAME;
        const password = process.env.ADMIN_PASSWORD;

        if (!email || !username || !password) {
            return res.status(500).json({
                message: 'Admin environment variables are missing.'
            });
        }

        const existingAdmin = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingAdmin) {
            if (!existingAdmin.isAdmin) {
                return res.status(409).json({
                    message: 'The configured admin email or username belongs to a non-admin account.'
                });
            }

            return res.status(200).json({
                message: 'Admin account already exists.'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            email,
            username,
            password: hashedPassword,
            isAdmin: true
        });

        return res.status(201).json({
            message: 'Admin account created successfully.'
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: 'Unable to create admin account.'
        });
    }
};

module.exports = { register, login, createAdmin };