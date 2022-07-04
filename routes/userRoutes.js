const express = require('express');
const {getAllUsers,createUser,getUser,updateUser,deleteUser, updateMe, deleteMe, getMe} = require('./../controllers/useController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.use(authController.protect);

router
    .patch('/updatePassword', 
    authController.updatePassword);

router
    .get('/me', 
    getMe, 
    getUser);

router
    .patch('/updateMe', 
    updateMe);

router
    .delete('/deleteMe', 
    deleteMe);

router.use(authController.restrictTo('admin'))

router
    .route('/')
    .get(getAllUsers)
    .post(createUser);

router
    .route('/:id')
    .get(getUser)
    .patch(updateUser)
    .delete(deleteUser);

module.exports = router;