import { Router, type IRouter } from "express";
import healthRouter from "./health";
import workoutsRouter from "./workouts";
import exercisesRouter from "./exercises";
import categoriesRouter from "./categories";
import adaloRouter from "./adalo";

const router: IRouter = Router();

router.use(healthRouter);
router.use(workoutsRouter);
router.use(exercisesRouter);
router.use(categoriesRouter);
router.use(adaloRouter);

export default router;
