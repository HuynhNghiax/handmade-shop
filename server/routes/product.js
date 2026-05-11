const router = require('express').Router();
const productController = require('../controllers/productController');
const { verifyAdmin } = require('../middleware/authMiddleware');

// Lấy toàn bộ sản phẩm
router.get('/', productController.getAllProducts);

// Lấy 1 sản phẩm cụ thể (ĐÂY LÀ CHỖ CẦN SỬA)
router.get('/:id', productController.getSingleProduct);

// Các quyền của Admin
router.post('/', verifyAdmin, productController.createProduct);
router.put('/:id', verifyAdmin, productController.updateProduct);
router.delete('/:id', verifyAdmin, productController.deleteProduct);

module.exports = router;