const express = require("express");
const app = express();
require("dotenv").config();
const PORT = process.env.PORT || 5000;
const URL = process.env.CLIENT_URL;
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);
const cors = require("cors");

app.use(cors({ origin: URL }));
app.use(express.json());

const storeItems = new Map([
  [1, { price: 1000, name: "Learn React" }],
  [2, { price: 2000, name: "Learn CSS" }],
  [3, { price: 2500, name: "Learn PHP" }],
  [4, { price: 3000, name: "Learn Python" }],
]);

app.post("/create-checkout-session", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: req.body.items.map((item) => {
        const storeItem = storeItems.get(item.id);
        return {
          price_data: {
            currency: "eur",
            product_data: {
              name: storeItem.name,
            },
            unit_amount: storeItem.price,
          },
          quantity: item.quantity,
        };
      }),
      success_url: `${URL}/success`,
      cancel_url: `${URL}/cancel`,
    });
    res.json({ url: session.url });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}...`);
});
