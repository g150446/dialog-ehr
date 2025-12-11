'use client';

import { useState } from 'react';

export default function PatientSearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  return (
    <>
      {/* Search Icon Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="px-3 md:px-4 py-1 md:py-1.5 bg-white hover:bg-gray-50 border border-blue-500 rounded text-xs md:text-sm text-gray-700 font-medium shadow-sm transition-colors flex items-center justify-center text-blue-600"
        aria-label="患者検索"
      >
        <svg
          className="w-4 h-4 md:w-5 md:h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </button>

      {/* Modal */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Modal Content */}
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 w-full max-w-3xl mx-4 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 border-b-2 border-blue-800 px-4 md:px-6 py-3 flex items-center justify-between">
              <h2 className="text-white text-base md:text-lg font-semibold">患者検索</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200 transition-colors"
                aria-label="閉じる"
              >
                <svg
                  className="w-5 h-5 md:w-6 md:h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Search Input Area */}
            <div className="p-4 md:p-6 bg-white">
              <div className="flex gap-2 md:gap-3">
                {/* Search Input */}
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="患者番号、フリガナ、名前、生年月日 (1999/1/1 または H11/1/1)、施設を入力してください"
                    className="w-full px-3 md:px-4 py-2 md:py-2.5 pr-20 border border-blue-200 rounded text-sm md:text-base text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                    {searchValue && (
                      <button
                        onClick={() => setSearchValue('')}
                        className="text-gray-600 hover:text-gray-800 transition-colors p-1"
                        aria-label="クリア"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    )}
                    <button
                      className="text-gray-600 hover:text-gray-800 transition-colors p-1"
                      aria-label="オプション"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Search Button */}
                <button
                  className="px-4 md:px-6 py-2 md:py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded text-sm md:text-base font-medium shadow-sm transition-colors whitespace-nowrap"
                >
                  検索
                </button>

                {/* New Patient Registration Button */}
                <button
                  className="px-4 md:px-6 py-2 md:py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded text-sm md:text-base font-medium shadow-sm transition-colors whitespace-nowrap"
                >
                  新規患者登録
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
