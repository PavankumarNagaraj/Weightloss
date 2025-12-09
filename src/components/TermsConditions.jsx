import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, CheckCircle, XCircle, AlertTriangle, Scale } from 'lucide-react';

const TermsConditions = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-300 hover:text-white mb-6 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>
          <div className="flex items-center gap-4 mb-4">
            <FileText className="w-12 h-12 text-yellow-400" />
            <h1 className="text-4xl font-bold">Terms & Conditions</h1>
          </div>
          <p className="text-gray-300">Last updated: December 9, 2025</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
          
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Agreement to Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              By accessing or using AFTERBURN's weight loss program, cafe services, and fitness tracking features, you agree to be bound by these Terms and Conditions. If you disagree with any part of these terms, you may not access our services.
            </p>
          </section>

          {/* Services */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">Our Services</h2>
            </div>
            
            <p className="text-gray-700 leading-relaxed mb-4">
              AFTERBURN provides:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Personalized weight loss programs and nutrition plans</li>
              <li>Fitness tracking and progress monitoring</li>
              <li>Cafe services with healthy meal options</li>
              <li>Subscription-based meal plans</li>
              <li>Google Fit integration for activity tracking</li>
              <li>Trainer guidance and support</li>
            </ul>
          </section>

          {/* User Accounts */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">User Accounts</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Account Creation</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>You must be at least 18 years old to create an account</li>
                  <li>You must provide accurate and complete information</li>
                  <li>You are responsible for maintaining account security</li>
                  <li>You must not share your account credentials</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Account Termination</h3>
                <p className="text-gray-700">
                  We reserve the right to suspend or terminate accounts that violate these terms or engage in fraudulent activity.
                </p>
              </div>
            </div>
          </section>

          {/* Subscriptions & Payments */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Scale className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Subscriptions & Payments</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Subscription Plans</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Subscriptions are billed on a recurring basis (monthly/quarterly/annually)</li>
                  <li>Prices are subject to change with 30 days notice</li>
                  <li>All fees are non-refundable unless required by law</li>
                  <li>You can cancel your subscription anytime</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Cancellation Policy</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Cancel anytime through your account settings</li>
                  <li>Cancellation takes effect at the end of the current billing period</li>
                  <li>No refunds for partial months or unused services</li>
                  <li>Access continues until the end of the paid period</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Cafe Orders</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Orders must be placed in advance</li>
                  <li>Payment is required at the time of order</li>
                  <li>Cancellations must be made at least 2 hours before delivery</li>
                  <li>Late cancellations may incur charges</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Health Disclaimer */}
          <section className="bg-yellow-50 rounded-xl p-6 border-2 border-yellow-200">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
              <h2 className="text-2xl font-bold text-gray-900">Health & Medical Disclaimer</h2>
            </div>
            
            <div className="space-y-3 text-gray-700">
              <p className="font-semibold text-yellow-900">
                IMPORTANT: Please read carefully
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Our services are <strong>not medical advice</strong></li>
                <li>Consult your doctor before starting any weight loss program</li>
                <li>We are not responsible for health issues arising from program use</li>
                <li>Individual results may vary</li>
                <li>Stop immediately if you experience adverse effects</li>
                <li>Pregnant or nursing women should consult a doctor first</li>
                <li>People with medical conditions must get medical clearance</li>
              </ul>
              <p className="text-sm text-yellow-800 mt-4">
                <strong>By using our services, you acknowledge that you are in good health and have consulted with a healthcare professional if necessary.</strong>
              </p>
            </div>
          </section>

          {/* Google Fit Integration */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Google Fit Integration</h2>
            
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Google Fit integration is optional</li>
              <li>We access fitness data with <strong>read-only permissions</strong></li>
              <li>We cannot modify or delete your Google Fit data</li>
              <li>You can disconnect Google Fit anytime</li>
              <li>Data syncs once per day to minimize API usage</li>
              <li>Google's Terms of Service also apply to Google Fit usage</li>
            </ul>
          </section>

          {/* User Conduct */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <XCircle className="w-6 h-6 text-red-600" />
              <h2 className="text-2xl font-bold text-gray-900">Prohibited Activities</h2>
            </div>
            
            <p className="text-gray-700 leading-relaxed mb-4">
              You agree NOT to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Use the service for any illegal purpose</li>
              <li>Violate any laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Transmit viruses or malicious code</li>
              <li>Harass, abuse, or harm others</li>
              <li>Impersonate others or provide false information</li>
              <li>Attempt to gain unauthorized access to systems</li>
              <li>Scrape or copy content without permission</li>
              <li>Share account credentials</li>
            </ul>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Intellectual Property</h2>
            
            <p className="text-gray-700 leading-relaxed mb-4">
              All content, features, and functionality are owned by AFTERBURN and protected by copyright, trademark, and other laws.
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>You may not copy, modify, or distribute our content</li>
              <li>Meal plans and workout programs are for personal use only</li>
              <li>You retain rights to your personal data and photos</li>
              <li>By uploading content, you grant us a license to use it for service provision</li>
            </ul>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Limitation of Liability</h2>
            
            <p className="text-gray-700 leading-relaxed mb-4">
              To the maximum extent permitted by law:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Services are provided "as is" without warranties</li>
              <li>We are not liable for indirect, incidental, or consequential damages</li>
              <li>Our total liability is limited to the amount you paid in the last 12 months</li>
              <li>We are not responsible for third-party services (Google Fit, payment processors)</li>
              <li>We do not guarantee specific weight loss results</li>
            </ul>
          </section>

          {/* Indemnification */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Indemnification</h2>
            <p className="text-gray-700 leading-relaxed">
              You agree to indemnify and hold AFTERBURN harmless from any claims, damages, or expenses arising from your use of the service, violation of these terms, or infringement of any rights.
            </p>
          </section>

          {/* Modifications */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Modifications to Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to modify these terms at any time. We will notify you of significant changes via email or app notification. Continued use after changes constitutes acceptance of the modified terms.
            </p>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Governing Law</h2>
            <p className="text-gray-700 leading-relaxed">
              These terms are governed by the laws of India. Any disputes will be resolved in the courts of Bangalore, Karnataka.
            </p>
          </section>

          {/* Severability */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Severability</h2>
            <p className="text-gray-700 leading-relaxed">
              If any provision of these terms is found to be unenforceable, the remaining provisions will continue in full force and effect.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have questions about these Terms & Conditions, please contact us:
            </p>
            <div className="space-y-2 text-gray-700">
              <p><strong>Email:</strong> support@afterburn.fit</p>
              <p><strong>Phone:</strong> 8899175788</p>
              <p><strong>Address:</strong> AFTERBURN Gym & Cafe, Bangalore, India</p>
            </div>
          </section>

          {/* Acceptance */}
          <section className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Acceptance of Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              By using AFTERBURN's services, you acknowledge that you have read, understood, and agree to be bound by these Terms & Conditions and our Privacy Policy.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
};

export default TermsConditions;
