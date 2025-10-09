import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerificationPage from './pages/VerificationPage';
import MenuPage from './pages/MenuPage';
import FavoritesPage from './pages/FavoritesPage'; // Import FavoritesPage
import RestaurantMenuPage from './pages/RestaurantMenuPage';
import RestaurantsPage from './pages/RestaurantsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import ProfilePage from './pages/ProfilePage';
import OrdersPage from './pages/OrdersPage';

// Footer Pages
import AboutUsPage from './pages/AboutUsPage';
import HowItWorksPage from './pages/HowItWorksPage';
import HealthGoalsPage from './pages/HealthGoalsPage';
import SustainabilityPage from './pages/SustainabilityPage';
import BlogPage from './pages/BlogPage';
import NutritionGuidePage from './pages/NutritionGuidePage';
import MealPlanningPage from './pages/MealPlanningPage';
import CustomerSupportPage from './pages/CustomerSupportPage';
import MobileAppPage from './pages/MobileAppPage';
import HelpCenterPage from './pages/HelpCenterPage';
import FoodSafetyPage from './pages/FoodSafetyPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import ContactUsPage from './pages/ContactUsPage';

// Dashboard Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import RestaurantListPage from './pages/admin/RestaurantListPage';
import DeliveryPartnerListPage from './pages/admin/DeliveryPartnerListPage';
import RestaurantDashboard from './pages/restaurant/RestaurantDashboard';
import RestaurantOnboardingPage from './pages/restaurant/RestaurantOnboardingPage';
import DeliveryDashboard from './pages/delivery/DeliveryDashboard';
import DeliveryOnboardingPage from './pages/delivery/DeliveryOnboardingPage';
import NotFoundPage from './pages/NotFoundPage';
import FoodDonatePage from './pages/FoodDonatePage';
import CreateRecipePage from './pages/CreateRecipePage';
import UserReservationsPage from './pages/UserReservationsPage';
import TableBookingPage from './pages/TableBookingPage';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <ScrollToTop />
          <div className="min-h-screen bg-white">
            <Layout>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/verify" element={<VerificationPage />} />
                <Route path="/menu" element={<MenuPage />} />
                <Route path="/menu/:restaurantId" element={<RestaurantMenuPage />} />
                <Route path="/restaurants" element={<RestaurantsPage />} />
                <Route path="/food-donate" element={<FoodDonatePage />} />
                
                {/* Protected Customer Routes */}
                <Route path="/favorites" element={
                  <ProtectedRoute requiredRole={["customer"]}>
                    <FavoritesPage />
                  </ProtectedRoute>
                } />
                <Route path="/cart" element={
                  <ProtectedRoute requiredRole={["customer"]}>
                    <CartPage />
                  </ProtectedRoute>
                } />
                <Route path="/checkout" element={
                  <ProtectedRoute requiredRole={["customer"]}>
                    <CheckoutPage />
                  </ProtectedRoute>
                } />
                <Route path="/order-success" element={
                  <ProtectedRoute requiredRole={["customer"]}>
                    <OrderSuccessPage />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute requiredRole={["customer", "restaurant", "delivery"]}>
                    <ProfilePage />
                  </ProtectedRoute>
                } />
                <Route path="/my-orders" element={
                  <ProtectedRoute requiredRole={["customer"]}>
                    <OrdersPage />
                  </ProtectedRoute>
                } />
                <Route path="/reservations" element={
                  <ProtectedRoute requiredRole={["customer"]}>
                    <UserReservationsPage />
                  </ProtectedRoute>
                } />
                <Route path="/create-recipe" element={
                  <ProtectedRoute requiredRole={["customer"]}>
                    <CreateRecipePage />
                  </ProtectedRoute>
                } />
                <Route path="/book-table" element={
                  <ProtectedRoute requiredRole={["customer"]}>
                    <TableBookingPage />
                  </ProtectedRoute>
                } />
                <Route path="/book-table/:restaurantId" element={
                  <ProtectedRoute requiredRole={["customer"]}>
                    <TableBookingPage />
                  </ProtectedRoute>
                } />

                {/* Footer Links */}
                <Route path="/about-us" element={<AboutUsPage />} />
                <Route path="/how-it-works" element={<HowItWorksPage />} />
                <Route path="/health-goals" element={<HealthGoalsPage />} />
                <Route path="/sustainability" element={<SustainabilityPage />} />
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/nutrition-guide" element={<NutritionGuidePage />} />
                <Route path="/meal-planning" element={<MealPlanningPage />} />
                <Route path="/customer-support" element={<CustomerSupportPage />} />
                <Route path="/mobile-app" element={<MobileAppPage />} />
                <Route path="/help-center" element={<HelpCenterPage />} />
                <Route path="/food-safety" element={<FoodSafetyPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="/terms-of-service" element={<TermsOfServicePage />} />
                <Route path="/contact-us" element={<ContactUsPage />} />
                
                {/* Admin Routes */}
                <Route path="/admin/*" element={
                  <ProtectedRoute requiredRole={["admin"]}>
                    <Routes> {/* Nested Routes for admin */}
                      <Route path="dashboard" element={<AdminDashboard />} />
                      <Route path="restaurants" element={<RestaurantListPage />} />
                      <Route path="delivery-partners" element={<DeliveryPartnerListPage />} />
                    </Routes>
                  </ProtectedRoute>
                } />
                
                {/* Restaurant Routes */}
                <Route path="/restaurant/onboarding" element={
                  <ProtectedRoute requiredRole={["restaurant"]}>
                    <RestaurantOnboardingPage />
                  </ProtectedRoute>
                } />
                <Route path="/restaurant/*" element={
                  <ProtectedRoute requiredRole={["restaurant"]}>
                    <RestaurantDashboard />
                  </ProtectedRoute>
                } />
                
                {/* Delivery Routes */}
                <Route path="/delivery/onboarding" element={
                  <ProtectedRoute requiredRole={["delivery"]}>
                    <DeliveryOnboardingPage />
                  </ProtectedRoute>
                } />
                <Route path="/delivery/*" element={
                  <ProtectedRoute requiredRole={["delivery"]}>
                    <DeliveryDashboard />
                  </ProtectedRoute>
                } />

                {/* Catch-all for 404 */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Layout>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;