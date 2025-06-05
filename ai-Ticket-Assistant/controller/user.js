import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { inngest } from "../inngest/client.js";

export const signup = async (req, res) => {
  const { username ,email, password, skills = [] } = req.body;
  try {
    const hashPswd = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashPswd, skills });

    // Fire the Inngest event for user signup
    await inngest.send({
      name: "user.signup",
      data: {
        email,
      },
    });

    const token = jwt.sign(
      {
        _id: user._id,
        email: user.email,
        role: user.role,
        skills: user.skills,
        username: user.username,
      },
      process.env.JWT_SECRET
    );

    res.json({ user, token });
  } catch (error) {
    res.status(500).json({ error: "Signup failed", details: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "🔴 User not found" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "🔴 Invalid credentials" });
    }

    const token = jwt.sign(
      {
        _id: user._id,
        email: user.email,
        role: user.role,
        skills: user.skills,
        username: user.username,
      },
      process.env.JWT_SECRET
    );

    res.json({ user, token });
  } catch (error) {
    res.status(500).json({ error: "Login failed", details: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    const token = await req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "🔴 Unautharized" });
    jwt.verify(token, process.env.JWT_SECRET, (err) => {
      if (err) return res.status(401).json({ error: "🔴 Invalid token" });
    });
    res.status(200).json({ message: "🔵 Successfully logged out" });
  } catch (error) {
    res.status(500).json({ error: "Logout failed", details: error.message });
  }
};

export const updateUser = async (req, res) => {
  const { skills = [], role, email } = req.body;
  try {
    if (req.user?.role !== "admin") {
      return res
        .status(403)
        .json({ error: "🔴 Forbidden: Only admins can update user roles." });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "🔴 User not found" });
    }

    User.updateOne(
      { email },
      {username},
      { skills: skills.length ? skills : user.skills, role }
    );
    return res.json({ message: "🔵 User updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Update failed", details: error.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      res
        .status(403)
        .json({ error: "🔴 Forbidden: Only admins can get user details." });
    }
    const users = await User.find().select("-password -__v");
    if (!users || users.length === 0) {
      return res.status(404).json({ error: "🔴 No users found" });
    }
    return res.json({ users });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to retrieve user", details: error.message });
  }
};
