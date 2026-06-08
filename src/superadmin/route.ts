import { Router } from "express";
import { Controller } from "./controller";
import { Validation } from "./payload";
import { validateSchema } from "../middleware/validators";
import dynamicUpload from "../middleware/multer";
import { authenticate } from "../middleware/auth";

const router = Router();
const controller = new Controller();



router
  .route("/login")
  .post(
    validateSchema({ body: Validation.loginFields }),
    controller.login
  );

router.use(authenticate('super'));

//super admin profile data
router.route("/data")
.get(controller.getSuperAdmin)
.put(validateSchema({body: Validation.updateCredentials}), controller.updateSuperAdmin);



router
  .route("/create-admin")
  .post(
    dynamicUpload,
    validateSchema({ body: Validation.body }),
    controller.createAdmin
  )
  .get(validateSchema({query:Validation.limits}),controller.get)
  .put(dynamicUpload, validateSchema({body:Validation.body, query:Validation._id}),controller.updateAdmin);


export default router;
