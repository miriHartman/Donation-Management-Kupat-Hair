import { Router } from 'express';
import { exchangeRateController } from '../controllers/exchangeRateController';

const router = Router();

router.get('/', exchangeRateController.getLatestRates);

export default router;