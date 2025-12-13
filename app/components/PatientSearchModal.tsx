'use client';

import { useState } from 'react';
import Link from 'next/link';
import { searchPatients } from '@/lib/api';
import { Patient } from '@/types/patient';

export default function PatientSearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      return;
    }

    setIsSearching(true);
    setHasSearched(true);
    try {
      const results = await searchPatients(searchValue.trim());
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setSearchValue('');
    setSearchResults([]);
    setHasSearched(false);
  };

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
            onClick={handleClose}
          />
          
          {/* Modal Content */}
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 w-full max-w-5xl mx-4 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 border-b-2 border-blue-800 px-4 md:px-6 py-3 flex items-center justify-between">
              <h2 className="text-white text-base md:text-lg font-semibold">患者検索</h2>
              <button
                onClick={handleClose}
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
                    onKeyPress={handleKeyPress}
                    placeholder="患者番号、フリガナ、名前、生年月日(1990/1/1など)を入力してください"
                    className="w-full px-3 md:px-4 py-2 md:py-2.5 pr-10 border border-blue-200 rounded text-sm md:text-base text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  </div>
                </div>

                {/* Search Button */}
                <button
                  onClick={handleSearch}
                  disabled={isSearching || !searchValue.trim()}
                  className="px-4 md:px-6 py-2 md:py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white rounded text-sm md:text-base font-medium shadow-sm transition-colors whitespace-nowrap"
                >
                  {isSearching ? '検索中...' : '検索'}
                </button>

                {/* New Patient Registration Button */}
                <button
                  className="px-4 md:px-6 py-2 md:py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded text-sm md:text-base font-medium shadow-sm transition-colors whitespace-nowrap"
                >
                  新規患者登録
                </button>
              </div>
            </div>

            {/* Search Results Area */}
            {hasSearched && (
              <div className="border-t border-gray-200 overflow-y-auto flex-1">
                {isSearching ? (
                  <div className="p-8 text-center text-gray-500">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2">検索中...</p>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <p>検索結果が見つかりませんでした</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                      <thead className="bg-gradient-to-b from-gray-200 to-gray-250 border-b-2 border-gray-400 sticky top-0">
                        <tr>
                          <th className="border border-gray-400 px-3 py-2.5 text-left w-14 text-gray-700 font-semibold">No.</th>
                          <th className="border border-gray-400 px-3 py-2.5 text-left w-24 text-gray-700 font-semibold">患者コード</th>
                          <th className="border border-gray-400 px-3 py-2.5 text-left w-28 text-gray-700 font-semibold">氏名</th>
                          <th className="border border-gray-400 px-3 py-2.5 text-left w-20 text-gray-700 font-semibold">年齢</th>
                          <th className="border border-gray-400 px-3 py-2.5 text-left w-16 text-gray-700 font-semibold">性別</th>
                          <th className="border border-gray-400 px-3 py-2.5 text-left w-20 text-gray-700 font-semibold">部署</th>
                          <th className="border border-gray-400 px-3 py-2.5 text-left w-20 text-gray-700 font-semibold">Bed</th>
                          <th className="border border-gray-400 px-3 py-2.5 text-left w-28 text-gray-700 font-semibold">入院日</th>
                          <th className="border border-gray-400 px-3 py-2.5 text-left w-28 text-gray-700 font-semibold">退院日</th>
                        </tr>
                      </thead>
                      <tbody>
                        {searchResults.map((patient, index) => (
                          <tr
                            key={patient.id}
                            className="hover:bg-blue-50 transition-colors border-b border-gray-300"
                          >
                            <td className="border border-gray-300 px-3 py-2.5 bg-white text-gray-700">{index + 1}</td>
                            <td className="border border-gray-300 px-3 py-2.5 bg-white text-gray-700 font-mono text-xs">{patient.patientCode}</td>
                            <td className="border border-gray-300 px-3 py-2.5 bg-white">
                              <Link
                                href={`/patients/${patient.id}`}
                                onClick={handleClose}
                                className="text-blue-700 hover:text-blue-900 hover:underline font-medium transition-colors"
                              >
                                {patient.name}
                              </Link>
                            </td>
                            <td className="border border-gray-300 px-3 py-2.5 bg-white text-gray-700">{patient.age}歳</td>
                            <td className="border border-gray-300 px-3 py-2.5 bg-white text-gray-700">{patient.gender}</td>
                            <td className="border border-gray-300 px-3 py-2.5 bg-white text-gray-700">{patient.department || '-'}</td>
                            <td className="border border-gray-300 px-3 py-2.5 bg-white text-gray-700">{patient.bed || '-'}</td>
                            <td className="border border-gray-300 px-3 py-2.5 bg-white text-gray-700">{patient.admissionDate || '-'}</td>
                            <td className="border border-gray-300 px-3 py-2.5 bg-white text-gray-700">{patient.dischargeDate || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}




