import React from 'react';
import SnellenChart from '../components/SnellenChart';

const VATest = () => {
  return (
    <div className="py-12 max-w-4xl mx-auto px-4 flex flex-col gap-8">
      <div className="text-center flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-black">Visual Acuity Screening</h1>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Perform a visual examination at home. Stand at the calibrated distance, complete both eye tests, and save the resulting scores to your profile.
        </p>
      </div>

      <SnellenChart />
    </div>
  );
};

export default VATest;
