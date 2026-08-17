import type { NextFunction, Request, Response } from "express";
import { send } from "../shared/utils/send-response.js";

export function validateContact(req: Request, res: Response, next: NextFunction): void {
  const { fullName, email, message } = req.body;
  const errors: Record<string, string> = {};

  if (!fullName || typeof fullName !== "string" || fullName.trim().length < 2) {
    errors.fullName = "Full name must be at least 2 characters";
  }

  if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "A valid email is required";
  }

  if (!message || typeof message !== "string" || message.trim().length < 10) {
    errors.message = "Message must be at least 10 characters";
  }

  if (Object.keys(errors).length > 0) {
    sendResponse(res, {
      success: false,
      status: 400,
      message: "Validation error",
      error: errors,
    });
    return;
  }

  // Sanitise whitespace before passing on
  req.body.fullName = fullName.trim();
  req.body.email = email.trim().toLowerCase();
  req.body.message = message.trim();

  next();
}
