import { User, UserSchema } from "../../models/userModel";
import { Router, Request, Response, NextFunction } from "express";
import { isAuthenticated } from "../../middleware/authMiddleware";

// TODO: UT for all routes
type RequestWithName = Request<{}, {}, { userName: string }>;

const createUser = async (
  req: RequestWithName,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userName } = req.body;
    const doesUserExist = await User.findOne({ userName });
    if (doesUserExist) {
      res.status(400).json({ message: "User already exists" });
      return;
    }
    const user = await User.create({ userName });
    req.session.user = user as UserSchema;
    res.status(200).json({ message: "User created", user });
  } catch (error) {
    next(error);
  }
};

const loginUser = async (
  req: RequestWithName,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userName } = req.body;
    const user = await User.findOne({ userName });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    req.session.user = user as UserSchema;
    res.status(200).json({ message: "User logged in", user });
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.find();
    res.status(200).json({ message: "Users fetched", users });
  } catch (error) {
    next(error);
  }
};

const getUser = async (
  req: RequestWithName,
  res: Response,
  next: NextFunction,
) => {
  res.status(200).json({ user: req.session.user });
};
const router = Router();

// TODO: fix to proper crud routes
router.post("/create", createUser);
router.post("/login", loginUser);
router.get("/", isAuthenticated, getAllUsers);
router.get("/currentUser", getUser);
export { router as userRoutes };
