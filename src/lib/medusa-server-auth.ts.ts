import axios from 'axios';

const MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000';
const MEDUSA_API_TOKEN = process.env.MEDUSA_API_TOKEN; // Add this to your .env

// Create an authenticated axios instance
export const createMedusaAxiosInstance = () => {
  const instance = axios.create({
    baseURL: MEDUSA_BACKEND_URL,
    headers: {
      'Content-Type': 'application/json',
      ...(MEDUSA_API_TOKEN && { Authorization: `Bearer ${MEDUSA_API_TOKEN}` })
    }
  });

  return instance;
};

// Or use JWT directly if you have admin credentials
export const authenticateWithMedusa = async () => {
  try {
    const response = await axios.post(`${MEDUSA_BACKEND_URL}/admin/auth/token`, {
      email: process.env.MEDUSA_ADMIN_EMAIL,
      password: process.env.MEDUSA_ADMIN_PASSWORD
    });

    return response.data.access_token;
  } catch (error) {
    console.error('Failed to authenticate with Medusa:', error);
    throw error;
  }
};
