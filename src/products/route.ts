import { Router } from "express";
import { Controller } from "./controller";
import { validateSchema } from "../middleware/validators";
import { Validation } from "./payload";

const router = Router();
const controller = new Controller();

router.route("/")
  .post(validateSchema({ body: Validation.body }), controller.createProduct);

router.route("/get-all")
  .get(controller.getAllProducts);

router.route("/:id")
  .get(validateSchema({ params: Validation.queryId }), controller.getProductById)
  .put(validateSchema({ params: Validation.queryId, body: Validation.update }), controller.updateProduct)
  .delete(validateSchema({ params: Validation.queryId }), controller.deleteProduct);

router.route("/:id/price-history")
  .get(validateSchema({ params: Validation.queryId }), controller.getPriceHistory);

export default router;