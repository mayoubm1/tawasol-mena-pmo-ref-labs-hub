import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Play, 
  LayoutDashboard, 
  Globe, 
  Archive, 
  Settings, 
  ShieldCheck,
  Sparkles
} from 'lucide-react';

interface TourStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  selector?: string; // Optional: If I want to highlight something in the future
}

export const OnboardingTour: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('alta_pmo_tour_seen');
    if (!hasSeenTour) {
      const timer = setTimeout(() => setIsOpen(true), 1500); // Delay for better intro
      return () => clearTimeout(timer);
    }
  }, []);

  const steps: TourStep[] = [
    {
      title: "Welcome to TAWASOL MENA Strategic Hub",
      description: "Welcome, Director. This is your central cockpit for regional clinical strategy, laboratory implementations, and steering committee oversight.",
      icon: <Sparkles className="w-8 h-8 text-indigo-400" />
    },
    {
      title: "Global Dashboard & KPIs",
      description: "Get real-time visibility into your 5-Phase Omics roadmap, capital expenditure status, and regional readiness across KSA, UAE, and Egypt.",
      icon: <LayoutDashboard className="w-8 h-8 text-indigo-400" />
    },
    {
      title: "Regional Hubs",
      description: "Switch between countries to manage localized implementation tracks. Each hub handles its own floorplans, asset audits, and SFDA/MOHAP compliance tasks.",
      icon: <Globe className="w-8 h-8 text-indigo-400" />
    },
    {
      title: "PMO Archive & File Uploads",
      description: "Access all standard operating protocols (SOPs), clinical guidelines, and project audits. You can now upload new documents directly via the 'Archive' tab.",
      icon: <Archive className="w-8 h-8 text-indigo-400" />
    },
    {
      title: "Secure Synchronization",
      description: "Integrate with external meeting streams and clinical dispatch channels. All steering syndicate intelligence is parsed and indexed automatically.",
      icon: <ShieldCheck className="w-8 h-8 text-indigo-400" />
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    setIsOpen(false);
    localStorage.setItem('alta_pmo_tour_seen', 'true');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleComplete}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Top Bar */}
            <div className="h-1 bg-slate-900 w-full relative">
              <motion.div 
                className="absolute top-0 left-0 h-full bg-[#4259ff]"
                initial={{ width: "0%" }}
                animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            <div className="p-8">
              <button 
                onClick={handleComplete}
                className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                id="tour-close-btn"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center text-center space-y-6">
                <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 ring-4 ring-indigo-500/5">
                  {steps[currentStep].icon}
                </div>

                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-white font-sans tracking-tight">
                    {steps[currentStep].title}
                  </h2>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {steps[currentStep].description}
                  </p>
                </div>

                <div className="flex items-center gap-4 pt-4 w-full">
                  {currentStep > 0 && (
                    <button
                      onClick={handleBack}
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl border border-slate-800 text-slate-300 font-semibold hover:bg-slate-800 transition-all active:scale-95 cursor-pointer"
                      id="tour-back-btn"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Back
                    </button>
                  )}
                  <button
                    onClick={handleNext}
                    className="flex-[2] flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold hover:shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all active:scale-95 cursor-pointer"
                    id="tour-next-btn"
                  >
                    {currentStep === steps.length - 1 ? (
                      <>Get Started <Play className="w-4 h-4 fill-current" /></>
                    ) : (
                      <>Next Step <ChevronRight className="w-4 h-4" /></>
                    )}
                  </button>
                </div>

                <div className="flex gap-1.5">
                  {steps.map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-1.5 rounded-full transition-all duration-300 ${i === currentStep ? "w-6 bg-[#4259ff]" : "w-1.5 bg-slate-800"}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
