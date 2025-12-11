import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import type { StringValue } from "ms";
import { User, UserRole, IUser } from "../models/User.model";
import { body, validationResult } from "express-validator";

export const register = [
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 6 }),
  body("firstName").trim().notEmpty(),
  body("lastName").trim().notEmpty(),
  body("role").isIn(["student", "lecturer", "admin"]).optional(),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { email, password, firstName, lastName, role, studentId, staffId } =
        req.body;

      const existingUser = await User.findOne({ email: email.toLowerCase() });

      if (existingUser) {
        res.status(400).json({ message: "User already exists" });
        return;
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const user = new User({
        email: email.toLowerCase(),
        passwordHash,
        firstName,
        lastName,
        role: role || UserRole.STUDENT,
        studentId: role === "student" ? studentId : null,
        staffId: role === "lecturer" || role === "admin" ? staffId : null,
      });

      await user.save();

      const jwtSecret = process.env.JWT_SECRET || "secret";
      const jwtExpiry: StringValue = (process.env.JWT_EXPIRES_IN ||
        "7d") as StringValue;

      const token = jwt.sign({ userId: user.id }, jwtSecret, {
        expiresIn: jwtExpiry,
      });

      res.status(201).json({
        message: "User created successfully",
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
];

export const login = [
  body("email").isEmail().normalizeEmail(),
  body("password").notEmpty(),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { email, password } = req.body;

      const user = await User.findOne({ email: email.toLowerCase() });

      if (!user || !user.isActive) {
        res.status(401).json({ message: "Invalid credentials" });
        return;
      }

      const isValidPassword = await bcrypt.compare(password, user.passwordHash);

      if (!isValidPassword) {
        res.status(401).json({ message: "Invalid credentials" });
        return;
      }

      const jwtSecret = process.env.JWT_SECRET || "secret";
      const jwtExpiry: StringValue = (process.env.JWT_EXPIRES_IN ||
        "7d") as StringValue;

      const token = jwt.sign({ userId: user.id }, jwtSecret, {
        expiresIn: jwtExpiry,
      });

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          studentId: user.studentId,
          staffId: user.staffId,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
];

export const getProfile = async (
  req: Request & { user?: IUser },
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    res.json({
      id: req.user.id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      role: req.user.role,
      studentId: req.user.studentId,
      staffId: req.user.staffId,
      phone: req.user.phone,
      department: req.user.department,
      createdAt: req.user.createdAt,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
