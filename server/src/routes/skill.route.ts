import { Router } from 'express';
import { create, getAll, getOne, remove, update } from '../controllers/skill.controller';
import { requireAdmin } from '../middlewares/auth.middleware';
import { rateLimit } from '../middlewares/rate-limit/rate-limit.middleware';

const skillRouter = Router();

const readRateLimit = rateLimit({
  action: 'skills-read',
  tiers: [
    { limit: 2, interval: 5 * 60 },
    { limit: 10, interval: 30 * 60 },
  ],
});

const writeRateLimit = rateLimit({
  action: 'skills-write',
  tiers: [
    { limit: 10, interval: 10 * 60 },
    { limit: 25, interval: 30 * 60 },
  ],
  failBehavior: 'closed',
});

skillRouter.get('/skills', readRateLimit, getAll);
skillRouter.get('/skills/:id', readRateLimit, getOne);
skillRouter.post('/skills', writeRateLimit, requireAdmin, create);
skillRouter.patch('/skills/:id', writeRateLimit, requireAdmin, update);
skillRouter.delete('/skills/:id', writeRateLimit, requireAdmin, remove);

export default skillRouter;
