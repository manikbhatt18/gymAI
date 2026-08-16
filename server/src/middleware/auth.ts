import { Request, Response, NextFunction } from "express";
import { createRemoteJWKSet, jwtVerify } from "jose";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
      };
    }
  }
}

import { decodeJwt } from "jose";

// 1. Configure the JWKS URL from the exact Render backend environment variable
const authBaseUrl = process.env.NEON_AUTH_BASE_URL || "https://ep-solitary-breeze-ak3k1msd.neonauth.c-3.us-west-2.aws.neon.tech/neondb/auth";
const JWKS_URL = new URL(`${authBaseUrl}/.well-known/jwks.json`);

// 2. Build the remote key set once at the module level (this handles caching)
const jwks = createRemoteJWKSet(JWKS_URL);

// 3. Create Middleware for verification
export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.error("[Auth Middleware] Missing or invalid auth header:", authHeader);
    res.status(401).json({ error: "Unauthorized: Missing Bearer token" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    // Exact Issuer Hardcode for extreme security
    const { payload } = await jwtVerify(token, jwks, {
      issuer: "https://ep-solitary-breeze-ak3k1msd.neonauth.c-3.us-west-2.aws.neon.tech",
    });
    
    if (!payload.sub) {
      console.error("[Auth Middleware] Payload missing sub:", payload);
      res.status(401).json({ error: "Unauthorized: Invalid token payload" });
      return;
    }

    // Attach user ID directly to the request object!
    req.user = { id: payload.sub };
    next();
  } catch (err) {
    try {
      const decoded = decodeJwt(token);
      console.error(`[Auth Middleware] JWT Verify Failed! Expected issuer: https://ep-solitary-breeze... Actual issuer inside token: ${decoded.iss}`);
    } catch (e) {}
    console.error("[Auth Middleware] JWT Verification failed error:", err);
    res.status(401).json({ error: "Unauthorized: Invalid or expired token" });
  }
};
