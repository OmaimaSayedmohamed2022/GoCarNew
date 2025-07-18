import Trip from "../models/tripModel.js";
import checkoutNodeJssdk from "@paypal/checkout-server-sdk";
import dotenv from "dotenv";
dotenv.config();

// إعداد PayPal SDK
const paypalEnv = new checkoutNodeJssdk.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID,
  process.env.PAYPAL_SECRET
);
const paypalClient = new checkoutNodeJssdk.core.PayPalHttpClient(paypalEnv);

// إنشاء طلب دفع PayPal
export const createPaypalPayment = async (req, res) => {
  try {
    const { tripId, amount } = req.body;

    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    // تحديث طريقة الدفع إvisa
    trip.paymentInfo.method = "visa";
    await trip.save();

    const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: amount?.toString() || "15.00"
          },
          custom_id: trip._id.toString()
        }
      ],
      application_context: {
        return_url: `https://your-frontend.com/paypal-success?tripId=${trip._id}`,
        cancel_url: `https://your-frontend.com/paypal-cancel?tripId=${trip._id}`
      }
    });

    const order = await paypalClient.execute(request);
    const approvalUrl = order.result.links.find(link => link.rel === 'approve').href;

    res.status(200).json({
      tripId: trip._id,
      approvalUrl,
      orderId: order.result.id
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// تأكيد الدفع بعد الرجوع من PayPal
export const capturePaypalPayment = async (req, res) => {
  try {
    const { orderId, tripId } = req.body;

    const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    const capture = await paypalClient.execute(request);

    const transactionId = capture.result.purchase_units[0].payments.captures[0].id;

    await Trip.findByIdAndUpdate(tripId, {
      "paymentInfo.status": "Paid",
      "paymentInfo.method": "visa",
      "paymentInfo.transactionId": transactionId,
      "paymentInfo.paidAt": new Date(),
      status: "Paid"
    });

    res.status(200).json({ success: true, transactionId });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
