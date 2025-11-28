import axios from 'axios';

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: any) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  notes: {
    address: string;
  };
  theme: {
    color: string;
  };
}

interface UserInfo {
  name: string;
  email: string;
  token: string;
}

interface OrderData {
  orderItems: any[];
  totalPrice: number;
  basicItems: any[];
  deliveryAddress: {
    address: string;
    city: string;
    pincode: string;
    phone: string;
  };
  estimatedTime: number;
  paymentMethod: string;
}

interface InitiateRazorpayPaymentArgs {
  total: number;
  userInfo: UserInfo;
  orderData: OrderData;
  navigate: (path: string, options?: any) => void;
  clearCart: () => Promise<void>;
  setIsProcessing: (processing: boolean) => void;
}

export const initiateRazorpayPayment = async ({
  total,
  userInfo,
  orderData,
  navigate,
  clearCart,
  setIsProcessing,
}: InitiateRazorpayPaymentArgs) => {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    // Create Razorpay order on backend
    const { data: razorpayOrder } = await axios.post(
      '/api/payment/razorpay/order',
      { amount: total, currency: 'INR' },
      config
    );

    const options: RazorpayOptions = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID as string, // Your Razorpay Key ID from .env
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      name: 'FeastHub',
      description: 'Healthy Food Delivery',
      order_id: razorpayOrder.id,
      handler: async function (response: any) {
        try {
          const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = response;

          // Verify payment on backend
          const { data: verificationResponse } = await axios.post(
            '/api/payment/razorpay/verify',
            { razorpay_order_id, razorpay_payment_id, razorpay_signature },
            config
          );

          if (verificationResponse.message === 'Payment verified successfully') {
            // Place the order after successful payment verification
            const orderResponse = await axios.post(
              `${import.meta.env.VITE_API_URL}/orders`,
              { ...orderData, paymentMethod: 'online', paymentStatus: 'Paid' }, // Ensure payment method is online
              config
            );

            const { _id } = orderResponse.data;

            // Clear cart and redirect to success page
            await clearCart();
            navigate('/order-success', {
              state: {
                orderId: _id,
                total: total,
                estimatedTime: 25,
              },
            });
          } else {
            console.error('Payment verification failed:', verificationResponse.message);
            alert('Payment verification failed. Please try again.');
          }
        } catch (error) {
          console.error('Error during payment verification:', error);
          alert('An error occurred during payment verification. Please try again.');
        } finally {
          setIsProcessing(false);
        }
      },
      prefill: {
        name: userInfo.name,
        email: userInfo.email,
        contact: orderData.deliveryAddress.phone,
      },
      notes: {
        address: orderData.deliveryAddress.address,
      },
      theme: {
        color: '#F37254', // Primary orange color
      },
    };

    const rzp1 = new (window as any).Razorpay(options);
    rzp1.on('payment.failed', function (response: any) {
      console.error('Razorpay payment failed:', response.error);
      alert('Payment failed: ' + response.error.description);
      setIsProcessing(false);
    });
    rzp1.open();
  } catch (error) {
    console.error('Error initiating Razorpay payment:', error);
    alert('Error initiating payment. Please try again.');
    setIsProcessing(false);
  }
};
