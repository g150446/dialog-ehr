'use client';

import { useState } from 'react';

export default function FloatingButton() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      {/* Floating Round Button */}
      <button
        onClick={() => setIsDialogOpen(true)}
        className="fixed bottom-[100px] left-5 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-colors z-40 flex items-center justify-center"
        aria-label="Open dialog"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      </button>

      {/* Dialog Modal */}
      {isDialogOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={() => setIsDialogOpen(false)}
          />
          
          {/* Dialog Content */}
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 p-6 min-w-[300px]">
            <div className="text-center">
              <p className="text-lg text-gray-800 mb-4">test</p>
              <button
                onClick={() => setIsDialogOpen(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}



