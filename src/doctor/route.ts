import { Router } from "express";
import { Controller } from "./controller";
import { validateSchema } from "../middleware/validators";
// import dynamicUpload from "../middleware/multer";
// import { authenticate } from "../middleware/auth";
import { Validation } from "./payload";
import dynamicUpload from "../middleware/multer";
import { authenticate } from "../middleware/auth";

const router = Router();
const controller = new Controller();


router.route("/register")
.post(dynamicUpload,validateSchema({body:Validation.body}), controller.Register);

router.route("/doctordata")
.get(authenticate('super'), validateSchema({query: Validation.batchWisePagination}),controller.getAllDoctorData)
.put(authenticate('super'), validateSchema({body: Validation.body, query: Validation.queryWithId}), controller.updateDoctorData)

export default router;