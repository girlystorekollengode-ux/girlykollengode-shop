import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Shield, Sparkles, Scale, RefreshCw, HelpCircle, ArrowLeft } from 'lucide-react';

const TermsConditions = () => {
  return (
    <div className="min-h-screen bg-[#FFF5F9] py-8 px-4 sm:px-6 lg:px-8 text-left">
      {/* Back to Home Link */}
      <div className="max-w-4xl mx-auto mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-primary transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-primary-100 shadow-pink-md overflow-hidden">
        {/* Decorative Header Banner */}
        <div className="bg-gradient-to-r from-primary-50 via-primary-100/50 to-primary-50 p-8 sm:p-12 text-center relative overflow-hidden border-b border-primary-100">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ec4899_1px,transparent_1px)] [background-size:16px_16px]"></div>
          <Sparkles className="text-primary mx-auto mb-4 animate-pulse" size={32} />
          <h1 className="font-playfair text-3xl sm:text-4xl font-black text-gray-800 tracking-tight">
            Terms &amp; Conditions
          </h1>
          <p className="font-dancing text-lg sm:text-xl text-primary font-bold mt-2">
            Your Trust, Our Commitment
          </p>
          <p className="text-[10px] sm:text-xs text-gray-400 font-semibold uppercase tracking-widest mt-4">
            Last Updated: July 2026
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-10 space-y-8 text-gray-600 leading-relaxed text-sm">
          <p className="font-medium text-gray-500 italic">
            Welcome to Girly Women's Clothing Store. By accessing or purchasing from our online store or retail location in Kollengode, Kerala, you agree to comply with and be bound by the following terms and conditions. Please read them carefully.
          </p>

          <div className="w-full h-px bg-primary-100/70" />

          {/* Section 1: General Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 text-gray-800">
              <div className="p-2 bg-primary-50 rounded-xl text-primary shrink-0">
                <FileText size={18} />
              </div>
              <h2 className="font-playfair text-lg sm:text-xl font-bold">1. Agreement to Terms</h2>
            </div>
            <p className="pl-11 text-xs sm:text-sm">
              These Terms &amp; Conditions govern the use of our services, online platform, and retail catalog. We reserve the right to modify these terms at any time without prior notice. Any updates will be posted directly to this page and will take effect immediately.
            </p>
          </div>

          {/* Section 2: Authenticity & Products */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 text-gray-800">
              <div className="p-2 bg-primary-50 rounded-xl text-primary shrink-0">
                <Shield size={18} />
              </div>
              <h2 className="font-playfair text-lg sm:text-xl font-bold">2. Products &amp; Authenticity</h2>
            </div>
            <div className="pl-11 space-y-2 text-xs sm:text-sm">
              <p>
                We take immense pride in offering <strong>100% genuine quality products</strong>. Our collections—including sarees, daily wear, nightwear, and traditional outfits—are sourced carefully to meet premium quality standards.
              </p>
              <p>
                While we make every effort to display accurate product details, fabric textures, and colors, slight variations may occur due to photography lighting or screen display differences.
              </p>
            </div>
          </div>

          {/* Section 3: Pricing & Payments */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 text-gray-800">
              <div className="p-2 bg-primary-50 rounded-xl text-primary shrink-0">
                <Scale size={18} />
              </div>
              <h2 className="font-playfair text-lg sm:text-xl font-bold">3. Pricing &amp; Order Acceptance</h2>
            </div>
            <div className="pl-11 space-y-2 text-xs sm:text-sm">
              <p>
                All prices listed are in Indian Rupees (INR) and are inclusive of relevant taxes unless stated otherwise. Delivery fees will be calculated during the checkout process.
              </p>
              <p>
                We reserve the right to cancel or refuse any orders in the event of stock unavailability, pricing errors, or suspected fraudulent activity. In such cases, full refunds will be issued to your original payment method.
              </p>
            </div>
          </div>

          {/* Section 4: Return Policy */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 text-gray-800">
              <div className="p-2 bg-primary-50 rounded-xl text-primary shrink-0">
                <RefreshCw size={18} />
              </div>
              <h2 className="font-playfair text-lg sm:text-xl font-bold">4. No Return &amp; No Refund Policy</h2>
            </div>
            <div className="pl-11 space-y-2 text-xs sm:text-sm">
              <p className="font-semibold text-gray-700">
                All sales are final. We enforce a strict No Return and No Refund Policy.
              </p>
              <p>
                Please review size guides, descriptions, and color options carefully before completing your purchase. 
                In the rare event of receiving a completely incorrect item or a verified manufacturing damage, please report it to our customer support within <strong>24 hours of delivery</strong> with unboxing video proof for review.
              </p>
            </div>
          </div>

          {/* Section 5: Support */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 text-gray-800">
              <div className="p-2 bg-primary-50 rounded-xl text-primary shrink-0">
                <HelpCircle size={18} />
              </div>
              <h2 className="font-playfair text-lg sm:text-xl font-bold">5. Contact &amp; Support</h2>
            </div>
            <div className="pl-11 space-y-2 text-xs sm:text-sm">
              <p>
                For any questions or queries regarding our terms, shipping services, or orders, please contact our help desk:
              </p>
              <ul className="list-disc pl-5 mt-1 space-y-1 font-semibold text-gray-700">
                <li>Email: support@girlystore.in</li>
                <li>Phone: +91 812988 98313 | +91 70120 65738</li>
                <li>Store Address: Block Office Road, Kollengode, Kerala</li>
              </ul>
            </div>
          </div>

          <div className="w-full h-px bg-primary-100/70" />

          {/* Bottom Trust Badge */}
          <div className="text-center pt-2">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
              Thank you for choosing Girly. Happy Shopping!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsConditions;
