import { Router } from "express";
import { Controller } from "./controller";
import { Validation } from "./payload";
import { validateSchema } from "../middleware/validators";
import dynamicUpload from "../middleware/multer";
import { authenticate } from "../middleware/auth";

const router = Router();
const controller = new Controller();

router.route("/request-otp").post(validateSchema({ body: Validation.requestOtp }), controller.requestOtp);
router.route("/login").post(validateSchema({ body: Validation.payloadFields }), controller.login);


router.route("/userdata")
.get(authenticate("super"), validateSchema({query:Validation.batchWisePagination}), controller.getAllUserData)
.put(authenticate("super"), validateSchema({body: Validation.registerProfile}), controller.updateAllUserData);

router.route("/feedbackdata")
.get(validateSchema({query: Validation.batchWisePagination}) ,controller.getAllFeedback)

router.use(authenticate("user"));

router.route("/register-profile")
.get(controller.getProfile)
.put(dynamicUpload ,validateSchema({ body: Validation.registerProfile }), controller.registerProfile)

router.route("/feedback")
.post(validateSchema({body:Validation.feedbackPayload}), controller.addFeedback)

// router.post("/verify-otp", validateSchema({body: Validation.verifyOtp}), controller.verifyOtp);



export default router;
