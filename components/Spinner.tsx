import React from 'react';

const Spinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
        <div
        className="w-12 h-12 rounded-full animate-spin
                    border-4 border-solid border-blue-500 border-t-transparent"
        ></div>
        <p className="text-blue-600 font-semibold">Generating... please wait.</p>
    </div>
  );
};

export default Spinner;