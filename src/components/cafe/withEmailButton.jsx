import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import EmailReportModal from './EmailReportModal';

// Higher-order component to add email button to any cafe tab
export const withEmailButton = (Component) => {
  return function WithEmailButton(props) {
    const [showEmailModal, setShowEmailModal] = useState(false);

    return (
      <>
        <Component {...props} showEmailModal={showEmailModal} setShowEmailModal={setShowEmailModal} />
        {showEmailModal && (
          <EmailReportModal
            showToast={props.showToast}
            onClose={() => setShowEmailModal(false)}
          />
        )}
      </>
    );
  };
};

// Standalone email button component that can be added to any header
export const EmailButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition shadow-lg hover:shadow-xl hover:-translate-y-0.5"
      title="Send Daily Report via Email"
    >
      <Mail className="w-5 h-5" />
      Email Report
    </button>
  );
};
