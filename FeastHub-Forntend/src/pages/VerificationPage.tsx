import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const VerificationPage = () => {
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState<'emailInput' | 'codeEntry'>('emailInput');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const emailFromQuery = queryParams.get('email');
    if (emailFromQuery) {
      setEmail(emailFromQuery);
      setStep('codeEntry');
      toast.info('Verification code sent to your email. Please check your inbox.');
    }
  }, [location.search]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/users/resend-verification`, { email });
      setStep('codeEntry');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send verification code. Please check your email.');
      toast.error(err.response?.data?.message || 'Failed to send verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/users/verify`, { email, verificationCode });
      toast.success('Account verified successfully! You can now log in.');
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verification failed. Please try again.');
      toast.error(err.response?.data?.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const resendCodeHandler = async () => {
    setResending(true);
    setError(null);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/users/resend-verification`, { email });
      toast.success(response.data.message || 'New verification code sent.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend code.');
      toast.error(err.response?.data?.message || 'Failed to resend code.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-gray flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-accent-charcoal">
            Verify Your Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {step === 'emailInput'
              ? 'Enter your email to receive a verification code.'
              : `A verification code has been sent to ${email}. Please enter it below.`}
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl relative mb-6" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {step === 'emailInput' && (
          <form className="mt-8 space-y-6" onSubmit={handleEmailSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email-address" className="sr-only">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-orange focus:border-primary-orange focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div>
              <button
                type="submit"
                disabled={loading || !email}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-teal-cyan hover:bg-gradient-to-br hover:from-teal-500 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-orange disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending Code...' : 'Send Verification Code'}
              </button>
            </div>
          </form>
        )}

        {step === 'codeEntry' && (
          <form className="mt-8 space-y-6" onSubmit={handleVerifyCodeSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email-address" className="sr-only">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  readOnly
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-orange focus:border-primary-orange focus:z-10 sm:text-sm bg-gray-50"
                  placeholder="Email address"
                  value={email}
                />
              </div>
              <div>
                <label htmlFor="verification-code" className="sr-only">
                  Verification Code
                </label>
                <input
                  id="verification-code"
                  name="verificationCode"
                  type="text"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-orange focus:border-primary-orange focus:z-10 sm:text-sm"
                  placeholder="Verification Code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || !verificationCode}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-teal-cyan hover:bg-gradient-to-br hover:from-teal-500 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-orange disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify Account'}
              </button>
            </div>
            <div className="text-center">
              <button
                type="button"
                onClick={resendCodeHandler}
                disabled={resending || !email}
                className="font-medium text-primary-orange hover:text-primary-orange/80 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resending ? 'Resending...' : 'Resend Code'}
              </button>
            </div>
          </form>
        )}

        <div className="text-sm text-center">
          <Link to="/login" className="font-medium text-primary-orange hover:text-primary-orange/80">
            Remembered your password? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerificationPage;