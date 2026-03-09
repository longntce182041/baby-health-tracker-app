const pointPackageService = require("../services/pointPackageService");

const createPointPackage = async (req, res) => {
  const { name, points, price } = req.body;

  try {
    if (!name || !points || !price) {
      return res.status(400).json({
        message: "name, points, and price are required",
      });
    }

    if (typeof points !== "number" || points <= 0) {
      return res.status(400).json({
        message: "points must be a positive number",
      });
    }

    if (typeof price !== "number" || price <= 0) {
      return res.status(400).json({
        message: "price must be a positive number",
      });
    }

    const pointPackage = await pointPackageService.createPointPackage({
      name,
      points,
      price,
    });

    res.status(201).json({
      message: "Point package created successfully",
      data: pointPackage,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const listPointPackages = async (req, res) => {
  try {
    const packages = await pointPackageService.getAllPointPackages();
    res.status(200).json({
      message: "Point packages retrieved successfully",
      data: packages,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getPointPackageById = async (req, res) => {
  const { id } = req.params;

  try {
    const pointPackage = await pointPackageService.getPointPackageById(id);

    if (!pointPackage) {
      return res.status(404).json({ message: "Point package not found" });
    }

    res.status(200).json({
      message: "Point package retrieved successfully",
      data: pointPackage,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updatePointPackage = async (req, res) => {
  const { id } = req.params;
  const { name, points, price } = req.body;

  try {
    const updateData = {};

    if (name !== undefined) updateData.name = name;

    if (points !== undefined) {
      if (typeof points !== "number" || points <= 0) {
        return res.status(400).json({
          message: "points must be a positive number",
        });
      }
      updateData.points = points;
    }

    if (price !== undefined) {
      if (typeof price !== "number" || price <= 0) {
        return res.status(400).json({
          message: "price must be a positive number",
        });
      }
      updateData.price = price;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        message: "At least one of name, points, price is required",
      });
    }

    const updated = await pointPackageService.updatePointPackageById(
      id,
      updateData,
    );

    if (!updated) {
      return res.status(404).json({ message: "Point package not found" });
    }

    res.status(200).json({
      message: "Point package updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deletePointPackage = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await pointPackageService.deletePointPackageById(id);

    if (!deleted) {
      return res.status(404).json({ message: "Point package not found" });
    }

    res.status(200).json({ message: "Point package deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createPointPackage,
  listPointPackages,
  getPointPackageById,
  updatePointPackage,
  deletePointPackage,
};
