import { Router } from 'express';
import { verifyToken } from '../middlewares/verifytoken/verifytoken';
import { UserController } from '../controllers/user/user.controller';


const { register, login, updateUserData, sendFriendRequset, acceptRejectFriendRequset, userProfile, userFriends, userFriendRequsets, siteUsers } = new UserController();

const router = Router();

// login user
router.post('/login', verifyToken, login);

// register new user
router.post('/register', register);

// update user data
router.put('/update/:id', verifyToken, updateUserData);

// send friend request
router.post('/send_friend_requset', verifyToken, sendFriendRequset);

// accept or reject friend requset
router.post('/accept_reject_friend_requset', verifyToken, acceptRejectFriendRequset);

// get user main data
router.get('/user_profile', userProfile);

// get user own friends
router.get('/user_friends', verifyToken, userFriends);

// user receved friend requests
router.get('/receved_friend_requsts', verifyToken, userFriendRequsets);

// get public users
router.get('/public_users', siteUsers);

export default router;