'use client';

import { useState } from 'react';

interface CheckoutButtonProps {
  amount?: number;
}

type Step = 'select' | 'loading' | 'success' | 'error';

export default function CheckoutButton({ amount = 100 }: CheckoutButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<Step>('select');
  const [checkoutId, setCheckoutId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleOpen = () => {
    setStep('select');
    setCheckoutId('');
    setErrorMsg('');
    setIsOpen(true);
  };

  const handleClose = () => {
    if (step === 'loading') return;
    setIsOpen(false);
  };

  const handlePayment = async (paymentType: 'CREDIT' | 'SUICA') => {
    setStep('loading');
    try {
      const res = await fetch('/api/square/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, paymentType }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || '決済リクエストに失敗しました');
        setStep('error');
        return;
      }
      setCheckoutId(data.checkoutId || '');
      setStep('success');
    } catch {
      setErrorMsg('ネットワークエラーが発生しました');
      setStep('error');
    }
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="px-2 md:px-3 py-1 md:py-1.5 bg-white hover:bg-green-50 border border-green-500 rounded text-xs text-green-700 font-medium shadow-sm transition-colors"
      >
        会計
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={handleClose}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 w-80">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-800">会計</h2>
              {step !== 'loading' && (
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                >
                  ×
                </button>
              )}
            </div>

            {/* Body */}
            <div className="px-5 py-6">
              {step === 'select' && (
                <>
                  <p className="text-sm text-gray-600 mb-5">
                    お支払い方法をお選びください
                    <span className="block mt-1 text-xs text-gray-400">金額: {amount.toLocaleString()}円</span>
                  </p>
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => handlePayment('CREDIT')}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      クレジット（タッチ決済）
                    </button>
                    <button
                      onClick={() => handlePayment('SUICA')}
                      className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Suica・交通系IC
                    </button>
                  </div>
                </>
              )}

              {step === 'loading' && (
                <div className="flex flex-col items-center py-4 gap-4">
                  <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                  <p className="text-sm text-gray-600">Squareターミナルに送信中...</p>
                </div>
              )}

              {step === 'success' && (
                <div className="flex flex-col items-center py-2 gap-3 text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-2xl">
                    ✓
                  </div>
                  <p className="text-sm font-medium text-gray-800">Squareターミナルに送信しました</p>
                  {checkoutId && (
                    <p className="text-xs text-gray-400 break-all">ID: {checkoutId}</p>
                  )}
                  <button
                    onClick={handleClose}
                    className="mt-2 px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm font-medium transition-colors"
                  >
                    閉じる
                  </button>
                </div>
              )}

              {step === 'error' && (
                <div className="flex flex-col items-center py-2 gap-3 text-center">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 text-2xl">
                    ✕
                  </div>
                  <p className="text-sm font-medium text-red-700">{errorMsg}</p>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => setStep('select')}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors"
                    >
                      再試行
                    </button>
                    <button
                      onClick={handleClose}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm font-medium transition-colors"
                    >
                      閉じる
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
