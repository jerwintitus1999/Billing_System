import * as service from "./service";

export const getAllProducts = async (req, res) => {
  try {

    const data =
      await service.getAllProducts();

    return res.status(200).json({
      success: true,
      data,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};