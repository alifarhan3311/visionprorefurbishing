const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key');

exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount } = req.body;

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        userId: req.user._id.toString()
      }
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
