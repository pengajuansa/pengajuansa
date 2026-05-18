import React from 'react';

interface TopbarProps {
  title?: React.ReactNode;
}

export default function Topbar({ title }: TopbarProps) {
  return (
    <header className="flex w-full items-center justify-between border-b border-gray-100 bg-white px-8 py-5">
      <div className="flex items-center">
        {title || (
          <>
            <h2 className="m-0 text-xl font-bold text-[#1A365D]">Semester Antara 2024</h2>
            <div className="mx-4 h-5 w-px bg-gray-300"></div>
            <span className="rounded-full bg-yellow-100 px-3 py-1 text-[10px] font-bold tracking-wide text-yellow-800">
              PENDAFTARAN DIBUKA
            </span>
          </>
        )}
      </div>
    </header>
  );
}
