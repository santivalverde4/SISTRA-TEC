import { Router } from "express";
import passport from "passport";
import {
  googleCallback,
  login,
  logout,
  refresh,
  register,
  completeGoogleOnboard
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
authRoutes.post("/google/complete", completeGoogleOnboard);
authRoutes.post("/forgot-password", require("../controllers/authForgotController").forgotPassword);
authRoutes.post("/reset-password", require("../controllers/authForgotController").resetPassword);
