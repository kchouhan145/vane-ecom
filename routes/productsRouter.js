const express = require('express');
const router = express.Router();
const path = require("path");
const multer = require("multer");
const productModel = require("../models/product-model");
const ownerAuth = require("../middlewares/owner-auth");

const storage = multer.diskStorage({
	destination: function (_req, _file, cb) {
		cb(null, path.join(process.cwd(), "public", "images"));
	},
	filename: function (_req, file, cb) {
		const safeName = file.originalname.replace(/\s+/g, "-");
		cb(null, `${Date.now()}-${safeName}`);
	}
});

const upload = multer({ storage });

router.get('/', (req, res) => {
	res.redirect('/shop');
});

router.post('/create', ownerAuth, upload.single('image'), async (req, res) => {
	let { name, price, discount, bgcolor, panelcolor, textcolor } = req.body;

	await productModel.create({
		image: req.file ? req.file.filename : "1bag.png",
		name,
		price: Number(price || 0),
		discount: Number(discount || 0),
		bgcolor: bgcolor || "#f4f4f5",
		panelcolor: panelcolor || "#ffffff",
		textcolor: textcolor || "#111827"
	});

	res.redirect('/owners/create?success=Product created successfully');
});

router.get('/delete/:id', ownerAuth, async (req, res) => {
	await productModel.findByIdAndDelete(req.params.id);
	res.redirect('/owners/admin');
});

module.exports = router;
