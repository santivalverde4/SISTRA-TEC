import { Router } from "express";
import passport from "passport";
import {
  googleCallback,
  login,
  logout,
  refresh,
  register
} from "../controllers/authController";

export const authRoutes = Router();

authRoutes.post("/register", register);
authRoutes.post("/login", login);
authRoutes.post("/refresh", refresh);
authRoutes.post("/logout", logout);
authRoutes.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false
  })
);
authRoutes.get("/google/callback", googleCallback);
