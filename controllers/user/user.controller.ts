import { hash, compare } from 'bcryptjs';
import { User } from '../../model/users/users.model';
import { Freind } from '../../model/friends/friends.model';
import * as mongoose from 'mongoose';
import { Response, Request } from 'express'

export class UserController {

    // login user
    login = async (req: Request, res: Response) => {
        const { email, password } = req.body;

        try {
            const data: any = await User.find({ email });

            if (data.length > 0) {

                const matchPW = await compare(password.toString(), data[0].password);
                if (!matchPW) return res.status(401).send({ error: 'email or password not founded' });

                res.status(200).send({
                    token: data[0].generateToken(),
                });
            } else {
                res.status(400).send({ error: 'user not found' });
            }
        } catch (e) {
            console.log(e);
        }

    };

    // register new user
    register = async (req: any, res: Response) => {
        req.body.password = await hash(req.body.password.toString(), 8);

        const user = new User(req.body);
        try {
            let result: any = await user.save();
            res.status(200).send({ _id: result._id, name: result.name, token: result.generateToken() });
        } catch (e) {
            res.status(400).send({ error: 'Error Saving Data' });
        }
    };

    // update user data
    updateUserData = async (req: any, res: Response) => {

        const { id } = req.params;
        const { name } = req.body;
        if (id !== req.userId) return res.status(400).send({ error: 'Unauthorized' });

        if (!mongoose.Types.ObjectId.isValid(req.userId)) return res.status(404).end();
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).end();

        try {
            const userUpdated: any = await User.findByIdAndUpdate(id, { $set: { name } }, { new: true }).select('name email');
            res.status(200).send({ success: 'update success', ...userUpdated._doc });
        } catch (e) {
            res.status(400).send({ error: 'Unauthorized' });
        }

    };

    // send friend request
    sendFriendRequset = async (req: any, res: Response) => {
        const targetUserId = req.body.userId;

        if (!mongoose.Types.ObjectId.isValid(targetUserId)) return res.status(404).end();
        if (!mongoose.Types.ObjectId.isValid(req.userId)) return res.status(404).end();

        try {
            const friendRequset = await Freind.findOneAndUpdate({ requester: req.userId, recipient: targetUserId }, { status: 2 }, { upsert: true });
            res.status(200).send({ success: 'requset sent successfully' });
        } catch (e) {
            console.log(e);
            res.status(500).send({ error: 'Error sending requst' });
        }
    };

    // accept or reject friend requset
    acceptRejectFriendRequset = async (req: any, res: Response) => {
        const { status, targetUserId } = req.body;

        if (!mongoose.Types.ObjectId.isValid(targetUserId)) return res.status(404).end();
        if (!mongoose.Types.ObjectId.isValid(req.userId)) return res.status(404).end();

        try {
            const friendReq = await Freind.find({ requester: targetUserId, recipient: req.userId });
            if (friendReq && status === 'accept') {
                await Freind.findOneAndUpdate({ requester: targetUserId, recipient: req.userId }, { status: 3 }, { upsert: true });
                await User.findOneAndUpdate({ _id: targetUserId }, { $addToSet: { friends: req.userId } });
                await User.findOneAndUpdate({ _id: req.userId }, { $addToSet: { friends: targetUserId } });
                res.status(200).send({ success: 'requset accepted successflly' });
            } else if (friendReq && status === 'reject') {
                await Freind.findOneAndRemove({ requester: targetUserId, recipient: req.userId });
                await User.findOneAndUpdate(
                    { _id: targetUserId },
                    { $pull: { friends: req.userId } }
                );
                await User.findOneAndUpdate(
                    { _id: req.userId, friends: targetUserId },
                    { $pull: { friends: targetUserId } }
                );
                res.status(200).send({ success: 'requset rejected successflly' });
            }
        } catch (e) {
            res.status(500).send({ error: 'Error' });
        }
    };

    // get user main data
    userProfile = async (req: any, res: Response) => {
        const { userId } = req.query;
        if (!mongoose.Types.ObjectId.isValid(userId)) return res.status(404).end();

        try {
            const getUserData = await User.findById(userId).select('name gander');
            res.send(getUserData);
        } catch (e) {
            res.status(500).send({ error: 'Error retriving user profile' });
        }
    };

    // get user own friends
    userFriends = async (req: any, res: Response) => {

        if (!mongoose.Types.ObjectId.isValid(req.userId)) return res.status(404).end();

        try {
            const userFriends = await Freind.find({ recipient: req.userId, status: 3 }).populate({ path: 'requester', select: 'name image' }).select('requester');
            res.status(200).send(userFriends);
        } catch (e) {
            console.log(e);
            res.status(500).send({ error: 'Error retriving data' });
        }
    };

    // get user own friends
    userFriendRequsets = async (req: any, res: Response) => {

        if (!mongoose.Types.ObjectId.isValid(req.userId)) return res.status(404).end();

        try {
            const userFriends = await Freind.find({ recipient: req.userId, status: 2 }).select('requester status');
            res.status(200).send(userFriends);
        } catch (e) {
            console.log(e);
            res.status(500).send({ error: 'Error retriving data' });
        }
    };

    // get public users
    siteUsers = async (req: any, res: Response) => {
        try {
            const users = await User.find({ isPublic: true }).select('name image gander');
            res.status(200).send(users);
        } catch (e) {
            console.log(e);
            res.status(404).send({ error: 'There\'s an Error' })
        }
    }
}