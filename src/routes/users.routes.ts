import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { UsersController } from '../controllers/UsersController';

const router = express.Router();
const usersController = new UsersController();

router.post('/login', usersController.login); 
router.post('/create', usersController.createUser);
router.get('/details/:id', authenticateToken, usersController.getUserDetails);
router.post('/updated-status', authenticateToken, usersController.updateStatus);
router.post('/logout', authenticateToken, usersController.logout);

export default router; 