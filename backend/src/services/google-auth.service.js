import dotenv from "dotenv";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { PrismaClient } from "../generated/prisma/index.js";

dotenv.config();

const prisma = new PrismaClient();

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

function generateToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
}

export async function loginWithGoogle(credential) {
  if (!credential) {
    throw new Error("Google credential is required");
  }

  if (!process.env.GOOGLE_CLIENT_ID) {
    throw new Error("GOOGLE_CLIENT_ID is not configured");
  }

  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  if (!payload?.email || !payload.email_verified) {
    throw new Error("Google account email could not be verified");
  }

  const email = payload.email.toLowerCase();
  const name =
    payload.name || email.split("@")[0];

  let user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        name,
        email,
        password: "",
      },
    });
  }

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token: generateToken(user),
  };
}