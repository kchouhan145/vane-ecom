const express = require('express');
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require('../models/user-model');
const userAuth = require("../middlewares/user-auth");

async function createUser(req, res) {
	let {fullName,email,password,contact,picture} = req.body;

	if (!fullName || !email || !password) {
		return res.redirect('/?error=fullName, email and password are required');
	}

	let passwordH = await bcrypt.hash(password,10);

	if(await userModel.findOne({email})) {
		return res.redirect('/?error=Email is already registered with another user');
	}

	await userModel.create({
		fullName,
		email,
		password:passwordH,
		contact,
		picture
	});

	const user = await userModel.findOne({ email });
	const token = jwt.sign(
		{ id: user._id, email: user.email, fullName: user.fullName },
		process.env.JWT_SECRET || "vane_user_secret",
		{ expiresIn: "1d" }
	);

	res.cookie("userToken", token, {
		httpOnly: true,
		sameSite: "lax",
		maxAge: 24 * 60 * 60 * 1000
	});

	res.status(201).redirect("/");
}

router.get('/', (req, res) => {
	res.send('Welcome to users route');
});

router.get('/login', (req, res) => {
	if (req.cookies.userToken) {
		try {
			jwt.verify(req.cookies.userToken, process.env.JWT_SECRET || "vane_user_secret");
			return res.redirect('/');
		} catch (_err) {
			res.clearCookie('userToken');
		}
	}
	res.render('user-login', { error: req.query.error || '' });
});

router.post("/create", async (req,res) => {
	return createUser(req, res);
});

router.post("/register", async (req, res) => {
	return createUser(req, res);
});

router.post("/login", async (req, res) => {
	let { email, password } = req.body;

	let user = await userModel.findOne({ email });
	if (!user) {
		return res.redirect('/users/login?error=Invalid email or password');
	}

	let ok = await bcrypt.compare(password, user.password);
	if (!ok) {
		return res.redirect('/users/login?error=Invalid email or password');
	}

	const token = jwt.sign(
		{ id: user._id, email: user.email, fullName: user.fullName },
		process.env.JWT_SECRET || "vane_user_secret",
		{ expiresIn: "1d" }
	);

	res.cookie("userToken", token, {
		httpOnly: true,
		sameSite: "lax",
		maxAge: 24 * 60 * 60 * 1000
	});

	res.status(200).redirect("/");
});

router.get('/logout', userAuth, (_req, res) => {
	res.clearCookie('userToken');
	res.redirect('/users/login');
});

router.post('/cart/add/:productId', userAuth, async (req, res) => {
	const { productId } = req.params;
	const user = await userModel.findById(req.user.id);
	const cart = Array.isArray(user.cart) ? user.cart : [];

	const idx = cart.findIndex((item) => String(item.product || item) === productId);
	if (idx >= 0) {
		const current = cart[idx];
		const qty = Number(current.quantity || 1) + 1;
		cart[idx] = { product: productId, quantity: qty };
	} else {
		cart.push({ product: productId, quantity: 1 });
	}

	user.cart = cart;
	await user.save();

	res.redirect(req.get('referer') || '/shop');
});

router.post('/cart/increase/:productId', userAuth, async (req, res) => {
	const { productId } = req.params;
	const user = await userModel.findById(req.user.id);
	const cart = Array.isArray(user.cart) ? user.cart : [];

	user.cart = cart.map((item) => {
		if (String(item.product || item) === productId) {
			return { product: productId, quantity: Number(item.quantity || 1) + 1 };
		}
		return item;
	});

	await user.save();
	res.redirect('/cart');
});

router.post('/cart/decrease/:productId', userAuth, async (req, res) => {
	const { productId } = req.params;
	const user = await userModel.findById(req.user.id);
	const cart = Array.isArray(user.cart) ? user.cart : [];

	const updated = [];
	for (const item of cart) {
		if (String(item.product || item) === productId) {
			const nextQty = Number(item.quantity || 1) - 1;
			if (nextQty > 0) {
				updated.push({ product: productId, quantity: nextQty });
			}
		} else {
			updated.push(item);
		}
	}

	user.cart = updated;
	await user.save();
	res.redirect('/cart');
});

router.post('/cart/remove/:productId', userAuth, async (req, res) => {
	const { productId } = req.params;
	const user = await userModel.findById(req.user.id);
	const cart = Array.isArray(user.cart) ? user.cart : [];

	user.cart = cart.filter((item) => String(item.product || item) !== productId);
	await user.save();
	res.redirect('/cart');
});

module.exports = router;