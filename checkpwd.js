import bcrypt from "bcryptjs";

// Example: check in a route or a debug script
const plain = "JEEVIsiva@123";
const hashed = "$2b$10$2I9k/K9hukd.Ap3o8CWp6.EeHM6gCxSloKgkvnTwiW3d4cbsVA4Oi" // from DB

const ok = await bcrypt.compare(plain, hashed);
console.log("Password match?", ok);
