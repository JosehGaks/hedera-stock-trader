'use client';

export default function TextColorFix() {
  return (
    <style jsx global>{`
      .text-gray-400 {
        color: #4b5563 !important;
      }
      
      .text-gray-500 {
        color: #374151 !important;
      }
      
      .text-gray-600 {
        color: #1f2937 !important;
      }
    `}</style>
  );
} 