import React from 'react';

const FocusCard = () => {
  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl mt-10">
      <div className="md:flex">
        <div className="p-8">
          <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">Focus Stats</div>
          <h1 className="block mt-1 text-lg leading-tight font-medium text-black">Today's Focus Summary</h1>
          <p className="mt-2 text-gray-500">
            You focused for <span className="font-bold text-indigo-600">4 hours 30 minutes</span> today. Great job staying productive!
          </p>
          <button className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition duration-300">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default FocusCard;
