const User = require('../models/user');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports = {
    signup: (req, res) => {
        const { id, userName, password } = req.body;
        User.find({ userName }).then((users) => {
            if (users.length >= 1) {
                return res.status(409).json({
                    message: 'userName exists'
                })
            }
        });
        bcrypt.hash(password, 10, (error, hash) => {
            if (error) {
                return res.status(500).json({
                    error
                })
            }
            const user = new User({
                _id: new mongoose.Types.ObjectId(),
                id,
                userName,
                password: hash
            })

            user.save().then((result) => {
                console.log(result);

                res.status(200).json({
                    message: 'User created'
                });
            }).catch(error => {
                res.status(500).json({
                    error
                })
            });
        });

    },
    login: (req, res) => {
        const { userName, password } = req.body;

        User.find({ userName }).then((users) => {
            if (users.length === 0) {
                return res.status(401).json({
                    message: 'Auth failed'
                });
            }

            const [user] = users;

            bcrypt.compare(password, user.password, (error, result) => {
                if (error) {
                    return res.status(401).json({
                        message: 'Auth failed'
                    });
                }
                if (result) {
                    const token = jwt.sign({
                        id: user._id,
                        userName: user.userName,
                    },
                        'process.env.JWT_KEY',
                        {
                            expiresIn: '1H'
                        });
                    return res.json(user);
                }
                res.status(401).json({
                    message: 'Auth failed'
                });
            })
        })
    },
    getAll: (req, res) => {
        User.find().then((users) => {
            res.json(users)
        }).catch(error => {
            res.status(500).json({
                error
            })
        });
    },
    getCurrent: (req, res) => {
        const userId = req.params.userId;

        User.findById(userId).then((user) => {
            res.status(200).json({
                user
            })
        }).catch(error => {
            res.status(500).json({
                error
            })
        });
    }
}