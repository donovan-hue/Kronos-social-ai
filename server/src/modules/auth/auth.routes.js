function createToken(user) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET_NOT_CONFIGURED");
  }

  return jwt.sign(
    {
      id: user._id.toString(),
      username: user.username
    },
    secret,
    {
      expiresIn: "7d"
    }
  );
}
