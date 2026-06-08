import ProductsModel from "./model";

export const getAllProducts =
async () => {

  return await ProductsModel.find();

};