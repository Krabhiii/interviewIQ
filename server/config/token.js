import jwt from "jsonwebtoken";

const genToken = async (userId) => {
  try {
    // Payload must be an object
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    return token;
  } catch (error) {
    console.error("Token generation error:", error);
    return null;
  }
};

export default genToken;
