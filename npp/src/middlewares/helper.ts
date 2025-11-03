import user from "../models/user";

export async function generateUserToken() {
  const genToken = () => Math.floor(1000000000 + Math.random() * 9000000000); // Generate a random 10-digit token
  let randomToken = genToken();
  while (await user.findOne({ candidateId: randomToken })) {
    randomToken = genToken();
  }
  return randomToken;
}