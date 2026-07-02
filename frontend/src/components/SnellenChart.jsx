import React, { useState, useEffect, useRef } from 'react';
import { Maximize2, Minimize2, ZoomIn, ZoomOut, ArrowRight, CheckCircle2, RotateCcw, AlertTriangle } from 'lucide-react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const SNELLEN_LINES = [
  { text: 'E', acuity: '6/60', size: 100 },
  { text: 'F P', acuity: '6/36', size: 60 },
  { text: 'T O Z', acuity: '6/24', size: 40 },
  { text: 'L P E D', acuity: '6/18', size: 30 },
  { text: 'P E C F D', acuity: '6/12', size: 20 },
  { text: 'E D F C Z P', acuity: '6/9', size: 15 },
  { text: 'F E L O P Z D', acuity: '6/6', size: 10 },
];

const SnellenChart = () => {
  const { user } = useAuth();

  // Test states
  const [step, setStep] = useState(0); // 0: Setup, 1: Right Eye, 2: Left Eye, 3: Results
  const [distance, setDistance] = useState('6m'); // 6m, 3m, custom
  const [zoomScale, setZoomScale] = useState(1); // Calibration zoom
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Results
  const [rightEyeAcui, setRightEyeAcui] = useState('');
  const [leftEyeAcui, setLeftEyeAcui] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');

  const chartContainerRef = useRef(null);

  // Fullscreen helper
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      chartContainerRef.current?.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error('Fullscreen error:', err);
      });
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const getInterpretation = (od, os) => {
    if (od === '6/6' && os === '6/6') {
      return 'Excellent! You have normal visual acuity (20/20 vision) in both eyes. Continue maintaining good eye health and scheduling routine examinations.';
    }
    if (od === '6/60' || os === '6/60' || od === '6/36' || os === '6/36') {
      return 'Severe visual impairment detected. Your visual acuity is significantly below normal. Please schedule a comprehensive clinical eye exam with an eye surgeon or optometrist as soon as possible.';
    }
    return 'Subnormal vision detected in one or both eyes. You may be experiencing mild to moderate refractive errors (nearsightedness, farsightedness, or astigmatism). We recommend booking an appointment with an eye care specialist to discuss corrective lenses.';
  };

  const saveResults = async () => {
    setSaving(true);
    setSaveError('');
    try {
      const interpretation = getInterpretation(rightEyeAcui, leftEyeAcui);
      await API.post('/va-tests', {
        right_eye_va: rightEyeAcui,
        left_eye_va: leftEyeAcui,
        interpretation
      });
      setSaved(true);
    } catch (e) {
      console.error(e);
      setSaveError(e || 'Failed to save results.');
    } finally {
      setSaving(false);
    }
  };

  const restartTest = () => {
    setStep(0);
    setRightEyeAcui('');
    setLeftEyeAcui('');
    setSaved(false);
    setSaveError('');
  };

  return (
    <div ref={chartContainerRef} className={`w-full flex flex-col items-center justify-between rounded-2xl p-6 ${isFullscreen ? 'bg-navy-950 min-h-screen text-slate-100 justify-center' : 'glass min-h-[500px]'}`}>

      {/* HEADER SECTION */}
      <div className="w-full flex flex-col md:flex-row items-center justify-between border-b border-slate-700/50 pb-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-teal-400">Visual Acuity Snellen Test</h2>

        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <button
            onClick={() => setZoomScale(prev => Math.min(prev + 0.1, 2.5))}
            className="p-2 bg-navy-800 hover:bg-navy-700 rounded-lg text-slate-300 border border-slate-700 transition-colors"
            title="Increase Chart Scale"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomScale(prev => Math.max(prev - 0.1, 0.5))}
            className="p-2 bg-navy-800 hover:bg-navy-700 rounded-lg text-slate-300 border border-slate-700 transition-colors"
            title="Decrease Chart Scale"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-navy-800 hover:bg-navy-700 rounded-lg text-slate-300 border border-slate-700 transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* STEP 0: CALIBRATION / INSTRUCTIONS */}
      {step === 0 && (
        <div className="flex-1 max-w-xl w-full flex flex-col justify-center gap-6">
          <div className="bg-teal-950/20 border border-teal-800/40 rounded-xl p-4 flex gap-3 text-slate-300">
            <CheckCircle2 className="w-6 h-6 text-teal-400 shrink-0" />
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-sm text-teal-400">Test Setup Guidance</span>
              <p className="text-xs text-black leading-relaxed">
                For accurate results, position yourself at the appropriate distance from the monitor. If possible, toggle Fullscreen mode and use the scale controls to adjust the chart size.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Test Distance</label>
              <div className="grid grid-cols-3 gap-2">
                {['6 meters (Recommended)', '3 meters', 'Custom distance'].map((label, idx) => {
                  const val = idx === 0 ? '6m' : idx === 1 ? '3m' : 'custom';
                  return (
                    <button
                      key={val}
                      onClick={() => setDistance(val)}
                      className={`py-2 px-3 border rounded-lg text-xs font-medium transition-all ${distance === val ? 'bg-teal-600/20 border-teal-500 text-teal-300' : 'bg-navy-900 border-slate-700 hover:bg-navy-800 text-slate-400'}`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-navy-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Calibration</span>
              <p className="text-xs text-slate-400 leading-relaxed">
                Adjust the zoom scale so the capital letter 'E' below measures approximately 3.5 inches (8.8 cm) in height if testing at 6m, or 1.7 inches (4.4 cm) if testing at 3m.
              </p>
              <div className="flex justify-center py-4 bg-black/35 rounded-lg border border-slate-800/80 my-2">
                <span className="font-extrabold text-white text-center leading-none" style={{ fontSize: `${88 * zoomScale}px` }}>E</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setStep(1)}
            className="w-full bg-teal-600 hover:bg-teal-500 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-teal-500/10"
          >
            Start Test (Right Eye) <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 1 & 2: RIGHT EYE & LEFT EYE TESTING */}
      {(step === 1 || step === 2) && (
        <div className="w-full flex flex-col lg:flex-row gap-8 items-stretch flex-1">
          {/* Chart Display Area */}
          <div className="flex-1 bg-black/40 border border-slate-800/80 rounded-2xl flex flex-col items-center justify-center py-8 px-4 overflow-hidden relative min-h-[350px]">
            <div className="absolute top-3 left-4 bg-teal-600/15 border border-teal-500/30 text-teal-400 text-[10px] font-bold uppercase px-2 py-1 rounded tracking-widest">
              {step === 1 ? 'Testing Right Eye (Cover Left)' : 'Testing Left Eye (Cover Right)'}
            </div>

            <div className="flex flex-col items-center select-none" style={{ transform: `scale(${zoomScale})` }}>
              {SNELLEN_LINES.map((line, idx) => (
                <div key={idx} className="flex items-center gap-8 my-1" style={{ height: `${line.size * 1.4}px` }}>
                  <span className="text-slate-600 text-[8px] font-mono tracking-widest w-12 text-right">{line.acuity}</span>
                  <span className="font-semibold text-white tracking-widest text-center select-none" style={{ fontSize: `${line.size}px` }}>
                    {line.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Test Input Control Panel */}
          <div className="w-full lg:w-80 flex flex-col justify-between bg-navy-900 border border-slate-800 p-6 rounded-2xl">
            <div className="flex flex-col gap-4">
              <span className="text-xs font-bold text-teal-400 uppercase tracking-widest">
                Step {step} of 2
              </span>

              <h3 className="text-lg font-bold">
                {step === 1 ? 'Right Eye Visual Acuity' : 'Left Eye Visual Acuity'}
              </h3>

              <p className="text-xs text-slate-400 leading-relaxed">
                Cover your {step === 1 ? 'LEFT' : 'RIGHT'} eye with your hand. Look at the chart and attempt to read the letters. Select the lowest line you can read clearly without squinting or straining.
              </p>

              <div className="flex flex-col gap-1.5 mt-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Select Smallest Readable Line</label>
                <div className="flex flex-col gap-1">
                  {SNELLEN_LINES.map((line) => (
                    <button
                      key={line.acuity}
                      onClick={() => {
                        if (step === 1) setRightEyeAcui(line.acuity);
                        else setLeftEyeAcui(line.acuity);
                      }}
                      className={`w-full py-2 px-3 border rounded-lg text-left text-xs font-medium flex items-center justify-between transition-all ${(step === 1 ? rightEyeAcui : leftEyeAcui) === line.acuity
                        ? 'bg-teal-600 border-teal-500 text-white font-semibold'
                        : 'bg-navy-950 border-slate-800 hover:bg-navy-800 text-slate-300'
                        }`}
                    >
                      <span>Line: {line.text}</span>
                      <span className={`${(step === 1 ? rightEyeAcui : leftEyeAcui) === line.acuity ? 'text-white' : 'text-slate-500'}`}>{line.acuity}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button
                disabled={!(step === 1 ? rightEyeAcui : leftEyeAcui)}
                onClick={() => setStep(prev => prev + 1)}
                className="w-full bg-teal-600 hover:bg-teal-500 disabled:bg-teal-850 disabled:text-slate-500 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
              >
                {step === 1 ? 'Proceed to Left Eye' : 'Finish Test & See Results'} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: RESULTS AND INTERPRETATION */}
      {step === 3 && (
        <div className="flex-1 max-w-xl w-full flex flex-col justify-center gap-6">
          <div className="text-center">
            <h3 className="text-2xl font-extrabold text-teal-400">Your VA Test Report</h3>
            <p className="text-xs text-slate-400 mt-1">Estimations calculated based on screen calibration</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-navy-900 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 shadow-md">
              <span className="text-[10px] font-bold text-black uppercase tracking-widest">Right Eye (OD)</span>
              <span className="text-3xl font-extrabold text-teal-400 font-mono">{rightEyeAcui}</span>
              <span className="text-[10px] text-slate-400">{rightEyeAcui === '6/6' ? 'Normal Vision' : 'Impaired Vision'}</span>
            </div>

            <div className="bg-navy-900 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 shadow-md">
              <span className="text-[10px] font-bold text-black uppercase tracking-widest">Left Eye (OS)</span>
              <span className="text-3xl font-extrabold text-teal-400 font-mono">{leftEyeAcui}</span>
              <span className="text-[10px] text-slate-400">{leftEyeAcui === '6/6' ? 'Normal Vision' : 'Impaired Vision'}</span>
            </div>
          </div>

          <div className="bg-navy-900/60 border border-slate-800/80 rounded-xl p-5 flex gap-3 shadow-inner leading-relaxed">
            <AlertTriangle className="w-6 h-6 text-yellow-500 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1.5">
              <span className="font-bold text-sm text-yellow-500">Interpretation & Disclaimer</span>
              <p className="text-xs text-slate-300">
                {getInterpretation(rightEyeAcui, leftEyeAcui)}
              </p>
              <p className="text-[15px] text-black mt-2 italic">
                *Note: This screening test is for educational purposes and is not a substitute for a professional eye exam by a licensed optometrist.
              </p>
            </div>
          </div>

          {/* User actions */}
          <div className="flex flex-col gap-2 mt-2">
            {user ? (
              saved ? (
                <div className="bg-teal-950/25 border border-teal-800/40 text-teal-400 rounded-xl py-3 text-center text-xs font-semibold">
                  Results successfully saved to your medical records!
                </div>
              ) : (
                <button
                  onClick={saveResults}
                  disabled={saving}
                  className="bg-teal-600 hover:bg-teal-500 disabled:bg-teal-800 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-teal-600/10"
                >
                  {saving ? 'Saving...' : 'Save Results to Profile'}
                </button>
              )
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-center text-xs text-slate-400 leading-normal">
                Want to track this? <a href="/login" className="text-teal-400 underline font-semibold">Log in or Register</a> to save these test scores to your account history.
              </div>
            )}

            {saveError && <span className="text-red-400 text-[10px] text-center">{saveError}</span>}

            <button
              onClick={restartTest}
              className="py-3 rounded-xl border border-slate-700 hover:bg-navy-900 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors mt-2"
            >
              <RotateCcw className="w-4 h-4" /> Repeat Test
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SnellenChart;
