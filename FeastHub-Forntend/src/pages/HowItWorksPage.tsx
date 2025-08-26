import React from 'react';

const HowItWorksPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">How It Works</h1>
      <p>FeastHub simplifies healthy eating into three easy steps:</p>
      <ol className="list-decimal list-inside mt-4">
        <li>Browse & Select: Explore a wide range of healthy meals from top-rated restaurants, filtered by your dietary needs and health goals.</li>
        <li>Order & Pay: Place your order securely through our app or website, with various convenient payment options.</li>
        <li>Enjoy & Track: Receive your delicious meal delivered to your doorstep and track your nutrition intake through our integrated tools.</li>
      </ol>
      <p className="mt-4">Our platform is designed for seamless user experience, ensuring you can find, order, and enjoy healthy food with minimal effort. We handle the logistics so you can focus on your well-being.</p>
    </div>
  );
};

export default HowItWorksPage;