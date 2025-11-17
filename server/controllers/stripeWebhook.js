import stripe from "stripe";
import Booking from "../models/Booking.js";

// Webhook to handle Stripe payment events
// POST /api/bookings/stripe-webhook
export const stripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

    let event;

    try {
        event = stripeInstance.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            
            if (session.payment_status === 'paid') {
                const bookingId = session.metadata.bookingId;
                
                try {
                    await Booking.findByIdAndUpdate(bookingId, { 
                        isPaid: true,
                        paymentMethod: 'Stripe'
                    });
                    console.log(`Booking ${bookingId} marked as paid via Stripe webhook`);
                } catch (error) {
                    console.error('Error updating booking:', error);
                }
            }
            break;
        
        case 'payment_intent.succeeded':
            console.log('Payment intent succeeded:', event.data.object.id);
            break;
        
        case 'payment_intent.payment_failed':
            console.log('Payment intent failed:', event.data.object.id);
            break;
        
        default:
            console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
};

export default stripeWebhook;

