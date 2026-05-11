const Product = require('../models/Product');

// 1. Lấy tất cả sản phẩm
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.findAll({ order: [['id', 'DESC']] });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy sản phẩm", error: error.message });
    }
};

// 2. Lấy 1 sản phẩm
exports.getSingleProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json("Không thấy sản phẩm");
        res.status(200).json(product);
    } catch (error) { res.status(500).json(error); }
};

// 3. Thêm mới
exports.createProduct = async (req, res) => {
    try {
        const newProduct = await Product.create(req.body);
        res.status(201).json(newProduct);
    } catch (error) { res.status(500).json(error); }
};

// 4. Cập nhật
exports.updateProduct = async (req, res) => {
    try {
        await Product.update(req.body, { where: { id: req.params.id } });
        res.status(200).json("Cập nhật thành công!");
    } catch (error) { res.status(500).json(error); }
};

// 5. Xóa
exports.deleteProduct = async (req, res) => {
    try {
        await Product.destroy({ where: { id: req.params.id } });
        res.status(200).json("Đã xóa sản phẩm!");
    } catch (error) { res.status(500).json(error); }
};