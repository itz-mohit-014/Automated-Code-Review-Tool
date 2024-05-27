import express from "express";
import { codeReview } from "../controlers/controllers.js";

const router = express.Router();

// router.route('/').get().post();
router.route('/reviews').post(codeReview);


export default router;