import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import EmailReportModal from './EmailReportModal';

const CafeTabHeader = ({ title, subtitle, children, showToast }) => {
  const [showEmailModal, setShowEmailModal] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            {title}
          </h2>
          <p className="text-gray-600 font-semibold mt-1">{subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          {children}
          <button
            onClick={() => setShowEmailModal(true)}
            className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            title="Send Daily Report via Email"
          >
            <Mail className="w-5 h-5" />
            Email Report
          </button>
        </div>
      </div>

      {showEmailModal && (
        <EmailReportModal
          showToast={showToast}
          onClose={() => setShowEmailModal(false)}
        />
      )}
    </>
  );
};

export default CafeTabHeader;
