import React from 'react';
import { useSettings } from '../../context/SettingsContext.jsx';
import { Target, Compass, Award, ShieldAlert, Cpu, CheckCircle } from 'lucide-react';

const About = () => {
  const { settings } = useSettings();

  const manufacturingSteps = [
    {
      step: '01',
      title: 'Precision Aggregate Blending',
      desc: 'Top-grade aggregates (granite powder, gravel, silica) are parsed and blended with premium cements and weather-resistant pigments.',
    },
    {
      step: '02',
      title: 'High-Compression Hydraulic Molding',
      desc: 'The concrete mix is loaded into hardened molds and subjected to severe hydraulic compression and vibration, yielding high density.',
    },
    {
      step: '03',
      title: 'Atmospheric Steam Curing',
      desc: 'The molded blocks are shifted to specialized curing compartments with monitored humidity and heat parameters to secure high strength.',
    },
    {
      step: '04',
      title: 'Compression Quality Testing',
      desc: 'Selected blocks are drawn from each curing batch and crushed in our hydraulic test rigs to verify they conform to IS 15658 parameters.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen space-y-20">
      
      {/* Hero header */}
      <div className="text-left space-y-4 max-w-3xl">
        <span className="text-primary-600 dark:text-primary-400 text-xs font-bold uppercase tracking-[0.2em] block">About Henco</span>
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl">Manufacturing Excellence</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          {settings.aboutText || 'Henco Interlock is a leading provider of premium landscaping and concrete paving solutions. Backed by state-of-the-art manufacturing processes and standard curing procedures, we craft bricks, paving blocks, and tiles that stand the test of time and weather.'}
        </p>
      </div>

      {/* Mission & Vision Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Mission */}
        <div className="bg-white dark:bg-dark-900 p-8 rounded-3xl border border-slate-200/50 dark:border-dark-800/50 space-y-4 text-left shadow-sm">
          <div className="w-12 h-12 bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-xl text-gray-900 dark:text-white">Our Mission</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            {settings.mission || 'To deliver premium quality, durable, and highly innovative landscaping and paving solutions that combine aesthetics with unparalleled engineering integrity.'}
          </p>
        </div>

        {/* Vision */}
        <div className="bg-white dark:bg-dark-900 p-8 rounded-3xl border border-slate-200/50 dark:border-dark-800/50 space-y-4 text-left shadow-sm">
          <div className="w-12 h-12 bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center">
            <Compass className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-xl text-gray-900 dark:text-white">Our Vision</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            {settings.vision || 'To be the most trusted and preferred partner in construction infrastructure, recognized for sustainable manufacturing practices and quality craftsmanship.'}
          </p>
        </div>

      </div>

      {/* Process flow layout */}
      <div className="space-y-12">
        <div className="text-center space-y-3">
          <span className="text-primary-600 dark:text-primary-400 text-xs font-bold uppercase tracking-[0.2em] block">How We Make It</span>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">Manufacturing Process</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">Step-by-step review of aggregate conversions to hardened paving block slabs.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {manufacturingSteps.map((step) => (
            <div
              key={step.step}
              className="bg-white dark:bg-dark-900 border border-slate-200/40 dark:border-dark-800/40 p-6 rounded-3xl relative overflow-hidden text-left hover:shadow-md transition-all shadow-sm"
            >
              <span className="absolute top-2 right-4 text-5xl font-extrabold text-slate-100 dark:text-dark-850 select-none z-0">
                {step.step}
              </span>
              <div className="relative z-10 space-y-3 pt-6">
                <h4 className="font-extrabold text-sm text-gray-900 dark:text-white leading-snug">{step.title}</h4>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Industrial Certifications */}
      <div className="bg-slate-50 dark:bg-dark-950 p-8 sm:p-12 rounded-3xl border border-slate-200/30 dark:border-dark-850 text-left space-y-6">
        <h3 className="text-xl font-extrabold text-gray-900 dark:text-white flex items-center space-x-2">
          <Award className="w-6 h-6 text-primary-500" />
          <span>Standards &amp; Quality Certifications</span>
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl">
          Henco concrete pavers and landscape stones are engineered to meet and surpass rigorous industrial standards. Each manufacturing run is strictly audited.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
          <div className="flex items-start space-x-2.5">
            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <h5 className="font-bold text-xs text-gray-900 dark:text-white">IS 15658:2021 Comp</h5>
              <span className="block text-[10px] text-gray-400">Concrete paving blocks specification compliance.</span>
            </div>
          </div>
          <div className="flex items-start space-x-2.5">
            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <h5 className="font-bold text-xs text-gray-900 dark:text-white">M30 - M50 Grades</h5>
              <span className="block text-[10px] text-gray-400">Compressive strengths tailored to light &amp; heavy vehicles.</span>
            </div>
          </div>
          <div className="flex items-start space-x-2.5">
            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <h5 className="font-bold text-xs text-gray-900 dark:text-white">ASTM Standards</h5>
              <span className="block text-[10px] text-gray-400">Low water absorption coefficients for freeze-thaw endurance.</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default About;
