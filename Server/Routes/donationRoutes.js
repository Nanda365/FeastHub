import express from 'express';
const router = express.Router();
import { createDonation, getAllDonations, acceptDonation } from '../Controllers/DonationController.js';

router.route('/').post(createDonation).get(getAllDonations);
import { protect } from '../middleware/auth.js';

router.route('/:id/accept').put(protect, acceptDonation);

export default router;
