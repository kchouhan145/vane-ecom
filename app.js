const express = require('express');
const PORT = 3000;
const app = express();
require('./config/mongoose-connection');
const userRouter = require("./routes/usersRouter");
const ownersRouter = require("./routes/ownerRouter");
const productRouter = require("./routes/productsRouter");
const productModel = require("./models/product-model");
const userModel = require("./models/user-model");
const jwt = require("jsonwebtoken");
const userAuth = require("./middlewares/user-auth");


const cookieParser = require("cookie-parser");
const path = require("path");
 
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname,"public")));
app.set("view engine","ejs");

app.use((req, res, next) => {
    const ownerToken = req.cookies.ownerToken;
    const userToken = req.cookies.userToken;

    res.locals.ownerLoggedIn = false;
    res.locals.ownerData = null;
    res.locals.userLoggedIn = false;
    res.locals.userData = null;

    if (ownerToken) {
        try {
            const decodedOwner = jwt.verify(ownerToken, process.env.JWT_SECRET || "vane_owner_secret");
            res.locals.ownerLoggedIn = true;
            res.locals.ownerData = decodedOwner;
        } catch (_err) {
            res.clearCookie("ownerToken");
        }
    }

    if (userToken) {
        try {
            const decodedUser = jwt.verify(userToken, process.env.JWT_SECRET || "vane_user_secret");
            res.locals.userLoggedIn = true;
            res.locals.userData = decodedUser;
        } catch (_err) {
            res.clearCookie("userToken");
        }
    }

    next();
});

app.get('/',(req,res)=>{
    if (res.locals.userLoggedIn) {
        return res.render("user-home", { user: res.locals.userData });
    }
    res.render("index", { error: req.query.error || "" });
});

app.get('/shop', async (req, res) => {
    let sortby = req.query.sortby;
    let sort = { createdAt: -1 };

    if (sortby === "popular") {
        sort = { discount: -1, createdAt: -1 };
    }

    let products = await productModel.find().sort(sort);
    res.render("shop", { products });
});

app.get('/cart', userAuth, async (req, res) => {
    const user = await userModel.findById(req.user.id);
    const rawCart = Array.isArray(user.cart) ? user.cart : [];

    const normalizedCart = rawCart
        .map((entry) => {
            if (entry && typeof entry === "object" && entry.product) {
                return {
                    product: String(entry.product),
                    quantity: Number(entry.quantity || 1)
                };
            }
            if (entry) {
                return {
                    product: String(entry),
                    quantity: 1
                };
            }
            return null;
        })
        .filter(Boolean);

    const productIds = normalizedCart.map((c) => c.product);
    const products = await productModel.find({ _id: { $in: productIds } });
    const productMap = new Map(products.map((p) => [String(p._id), p]));

    const cartItems = normalizedCart
        .map((c) => {
            const product = productMap.get(c.product);
            if (!product) return null;
            return {
                product,
                quantity: c.quantity,
                lineTotal: Math.max((Number(product.price || 0) - Number(product.discount || 0)), 0) * c.quantity
            };
        })
        .filter(Boolean);

    const subtotal = cartItems.reduce((sum, item) => sum + item.lineTotal, 0);
    const platformFee = cartItems.length ? 20 : 0;
    const total = subtotal + platformFee;

    res.render("cart", { cartItems, subtotal, platformFee, total });
});

app.use("/users",userRouter);
app.use("/products",productRouter);
app.use("/owners",ownersRouter);



app.listen(PORT,()=>{
    console.log(`Server is running at ${PORT}`);
});