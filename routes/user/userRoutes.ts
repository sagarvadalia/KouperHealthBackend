import { User, UserSchema } from "../../models/userModel";
import {
    Router,
    Request,
    Response,
    NextFunction
  } from 'express';
import { Document } from "mongoose";
import { isAuthenticated } from "../../middleware/authMiddleware";

// TODO: UT for all routes

type RequestWithName = Request<{}, {}, { userName: string }>;

const createUser = async (req: RequestWithName, res: Response, next: NextFunction) => {
    try {
        const { userName } = req.body;
        const doesUserExist = await User.findOne({ userName });
        if(doesUserExist) {
            res.status(400).json({ message: "User already exists" });
            return;
        }
        const user = await User.create({ userName });
        res.status(200).json({ message: "User created", user });
    } catch (error) {
        next(error);
    }
}

// TODO: figure out how to setup middleware to check if user is logged in
// TODO: properly store the user on the session for consumption by the pdf parsing route
const loginUser = async (req: RequestWithName, res: Response, next: NextFunction) => {
    try {
        const { userName } = req.body;
        const user = await User.findOne({ userName });
        if(!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        req.session.user = user as Document<UserSchema>;
        res.status(200).json({ message: "User logged in", user });
    } catch (error) {
        next(error);
    }
}

const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await User.find();
        res.status(200).json({ message: "Users fetched", users });
    } catch (error) {
        next(error);
    }
}
const router = Router();

// TODO: fix to proper crud routes
router.post('/create', createUser);
router.post('/login', loginUser);
router.get('/', isAuthenticated, getAllUsers);

export { router as userRoutes };
