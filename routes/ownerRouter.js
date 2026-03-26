const express = require('express');
const router = express.Router();
// const app = express();
const ownerModel = require("../models/owner-model");
const productModel = require("../models/product-model");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const ownerAuth = require("../middlewares/owner-auth");

router.get("/",(req,res)=>{
    res.send("Welcome to owner route");
});

router.get("/admin", ownerAuth, async (_req, res) => {
    let products = await productModel.find().sort({ createdAt: -1 });
    res.render("admin", { products });
});

router.get("/create", ownerAuth, (req, res) => {
    res.render("createproducts", { success: req.query.success || "" });
});

router.get("/login", (req, res) => {
    if (req.cookies.ownerToken) {
        try {
            jwt.verify(req.cookies.ownerToken, process.env.JWT_SECRET || "vane_owner_secret");
            return res.redirect("/owners/admin");
        } catch (_err) {
            res.clearCookie("ownerToken");
        }
    }
    res.render("owner-login", { error: req.query.error || "" });
});

router.post("/create",async (req,res)=>{
    let {fullName,email,password,picture} = req.body;

    let passwordH = await bcrypt.hash(password,10);
    if(await ownerModel.findOne({ email })){
        return res.status(409).send("Owner already exists with this email");
    }

    await ownerModel.create({
        fullName,
        email,
        password:passwordH,
        picture
    });

    res.status(201).redirect("/owners/login");
});

router.post("/login", async (req, res) => {
    let { email, password } = req.body;

    let owner = await ownerModel.findOne({ email });
    if (!owner) {
        return res.redirect("/owners/login?error=Invalid owner credentials");
    }

    let ok = await bcrypt.compare(password, owner.password);
    if (!ok) {
        return res.redirect("/owners/login?error=Invalid owner credentials");
    }

    const token = jwt.sign(
        { id: owner._id, email: owner.email, fullName: owner.fullName },
        process.env.JWT_SECRET || "vane_owner_secret",
        { expiresIn: "1d" }
    );

    res.cookie("ownerToken", token, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000
    });

    res.redirect("/owners/admin");
});

router.get("/logout", ownerAuth, (_req, res) => {
    res.clearCookie("ownerToken");
    res.redirect("/owners/login");
});

module.exports = router;