import bcrypt from 'bcrypt';

export const hashPassword = async (password: string) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (data: {
  hash: string;
  password: string;
}) => {
  return await bcrypt.compare(data.password, data.hash);
};
