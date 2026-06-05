import { Router } from "express";
import { authJwt } from "../middlewares/authJwt";
import {
  getUserById,
  updateUser,
  changePassword
} from "../controllers/usersController";

const router = Router();

const forwardToWithAuthId = (handler: any) => {
  return (req: any, res: any, next: any) => {
    req.params = req.params || {};
    const auth = (req as any).auth;
    if (!auth || !auth.sub) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    req.params.id = auth.sub;
    return handler(req, res, next);
  };
};

router.get("/me", authJwt, forwardToWithAuthId(getUserById));
router.put("/me", authJwt, forwardToWithAuthId(updateUser));

router.post("/me/change-password", authJwt, forwardToWithAuthId(changePassword));

export default router;
