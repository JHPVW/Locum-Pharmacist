import {
  Beaker,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  FileText,
  Mail,
  MapPin,
  Pill,
  Users,
} from 'lucide-react';
import {FC, memo, useCallback, useEffect, useState} from 'react';

interface Suburb {
  name: string;
  time: number | null;
}

interface BreakdownItem {
  label: string;
  value: number;
  isFlat?: boolean;
}

interface FormData {
  suburb: string;
  travelTime: number;
  scriptsPerDay: number;
  techQuality: string;
  ostVolume: string;
  daaComplexity: string;
  compounding: string;
  email: string;
  phone: string;
  contactPreference: string;
  pharmacyName: string;
  shiftDate: string;
  isPublicHoliday: boolean;
  shortNotice: 'normal' | 'within24hrs';
  shiftHours: string;
}

const VIC_PUBLIC_HOLIDAYS_2025 = [
  '2025-01-01',
  '2025-01-27',
  '2025-03-10',
  '2025-04-18',
  '2025-04-19',
  '2025-04-20',
  '2025-04-21',
  '2025-04-25',
  '2025-06-09',
  '2025-11-04',
  '2025-12-25',
  '2025-12-26',
];

const isPublicHoliday = (dateString: string) => {
  if (!dateString) {
    return false;
  }
  return VIC_PUBLIC_HOLIDAYS_2025.includes(dateString);
};

// Melbourne suburbs with approximate travel times
const suburbs: Suburb[] = [
  {name: 'Melbourne CBD', time: 0},
  {name: 'Carlton', time: 10},
  {name: 'Fitzroy', time: 12},
  {name: 'Collingwood', time: 15},
  {name: 'Richmond', time: 15},
  {name: 'South Yarra', time: 18},
  {name: 'St Kilda', time: 20},
  {name: 'Brunswick', time: 20},
  {name: 'Footscray', time: 25},
  {name: 'Hawthorn', time: 22},
  {name: 'Kew', time: 25},
  {name: 'Preston', time: 28},
  {name: 'Coburg', time: 25},
  {name: 'Essendon', time: 28},
  {name: 'Moonee Ponds', time: 25},
  {name: 'Yarraville', time: 28},
  {name: 'Williamstown', time: 32},
  {name: 'Port Melbourne', time: 20},
  {name: 'Albert Park', time: 18},
  {name: 'Glen Waverley', time: 38},
  {name: 'Box Hill', time: 35},
  {name: 'Doncaster', time: 35},
  {name: 'Camberwell', time: 25},
  {name: 'Malvern', time: 22},
  {name: 'Caulfield', time: 25},
  {name: 'Bentleigh', time: 30},
  {name: 'Brighton', time: 28},
  {name: 'Sandringham', time: 35},
  {name: 'Other (specify travel time)', time: null},
].sort((a, b) => a.name.localeCompare(b.name));

const BASE_RATE = 70;
const MIN_RATE = 65;
const MAX_RATE = 110;
const RATE_INCREMENT = 1.25;

const formatCurrency = (value: number, options: {withSymbol?: boolean} = {}) => {
  const {withSymbol = true} = options;
  const formatted = value % 1 === 0 ? value.toFixed(0) : value.toFixed(2);
  return withSymbol ? `$${formatted}` : formatted;
};

const defaultFormData: FormData = {
  suburb: '',
  travelTime: 0,
  scriptsPerDay: 150,
  techQuality: '',
  ostVolume: '',
  daaComplexity: '',
  compounding: '',
  email: '',
  phone: '',
  contactPreference: 'email',
  pharmacyName: '',
  shiftDate: '',
  isPublicHoliday: false,
  shortNotice: 'normal',
  shiftHours: '',
};

const PricingCalculator: FC = memo(() => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(defaultFormData);

  const [rate, setRate] = useState(BASE_RATE);
  const [breakdown, setBreakdown] = useState<BreakdownItem[]>([{label: 'Base Rate', value: BASE_RATE}]);
  const [submitted, setSubmitted] = useState(false);

  const calculateRate = useCallback(() => {
    let calculatedRate = BASE_RATE;
    const newBreakdown: BreakdownItem[] = [{label: 'Base Rate', value: BASE_RATE}];

    // Script count adjustment
    if (formData.scriptsPerDay < 120) {
      calculatedRate -= 5;
      newBreakdown.push({label: 'Low Script Volume (0-120)', value: -5});
    } else if (formData.scriptsPerDay >= 200 && formData.scriptsPerDay < 250) {
      calculatedRate += 10;
      newBreakdown.push({label: 'High Script Volume (200-250)', value: 10});
    } else if (formData.scriptsPerDay >= 250) {
      calculatedRate += 15;
      newBreakdown.push({label: 'Very High Script Volume (250+)', value: 15});
    } else if (formData.scriptsPerDay >= 150 && formData.scriptsPerDay < 200) {
      if (formData.techQuality === 'poor') {
        calculatedRate += 15;
        newBreakdown.push({label: 'Scripts 150-200 with Poor Tech', value: 15});
      } else if (formData.techQuality === 'average') {
        calculatedRate += 5;
        newBreakdown.push({label: 'Scripts 150-200 with Average Tech', value: 5});
      }
    }

    // Tech quality adjustment (independent of scripts if outside 150-200 range)
    if (formData.scriptsPerDay < 150 || formData.scriptsPerDay >= 200) {
      if (formData.techQuality === 'poor') {
        calculatedRate += 10;
        newBreakdown.push({label: 'Poor Tech Support', value: 10});
      } else if (formData.techQuality === 'good') {
        calculatedRate -= 5;
        newBreakdown.push({label: 'Good Tech Support', value: -5});
      } else if (formData.techQuality === 'excellent') {
        calculatedRate -= 10;
        newBreakdown.push({label: 'Excellent Tech Support (2+ techs)', value: -10});
      }
    }

    // OST adjustment
    if (formData.ostVolume === 'medium') {
      calculatedRate += 5;
      newBreakdown.push({label: 'OST Volume (5-20/day)', value: 5});
    } else if (formData.ostVolume === 'high') {
      calculatedRate += 10;
      newBreakdown.push({label: 'OST Volume (>20/day)', value: 10});
    }

    // DAA adjustment
    if (formData.daaComplexity === 'moderate') {
      calculatedRate += 5;
      newBreakdown.push({label: 'Moderate DAA Changes', value: 5});
    } else if (formData.daaComplexity === 'complex') {
      calculatedRate += 10;
      newBreakdown.push({label: 'Complex DAA Management', value: 10});
    }

    // Compounding adjustment
    if (formData.compounding === 'regular') {
      calculatedRate += 5;
      newBreakdown.push({label: 'Regular Compounding', value: 5});
    } else if (formData.compounding === 'complex') {
      calculatedRate += 10;
      newBreakdown.push({label: 'Complex Compounding', value: 10});
    }

    // Travel time adjustment
    if (formData.travelTime >= 25 && formData.travelTime < 35) {
      calculatedRate += 5;
      newBreakdown.push({label: 'Travel Time (25-35 min)', value: 5});
    } else if (formData.travelTime >= 35 && formData.travelTime < 45) {
      calculatedRate += 10;
      newBreakdown.push({label: 'Travel Time (35-45 min)', value: 10});
    } else if (formData.travelTime >= 45 && formData.travelTime <= 55) {
      calculatedRate += 12.5;
      newBreakdown.push({label: 'Travel Time (45-55 min)', value: 12.5});
    }

    calculatedRate = Math.max(MIN_RATE, Math.min(MAX_RATE, calculatedRate));
    calculatedRate = Math.round(calculatedRate / RATE_INCREMENT) * RATE_INCREMENT;

    if (formData.isPublicHoliday) {
      const holidaySurcharge = Number((calculatedRate * 0.1).toFixed(2));
      calculatedRate += holidaySurcharge;
      newBreakdown.push({
        label: 'Public Holiday Surcharge (10%)',
        value: holidaySurcharge,
      });
    }

    if (formData.shortNotice === 'within24hrs') {
      newBreakdown.push({
        label: 'Short Notice Fee (<24hrs) - Flat',
        value: 30,
        isFlat: true,
      });
    }

    calculatedRate = Math.max(MIN_RATE, Math.min(MAX_RATE, calculatedRate));
    calculatedRate = Math.round(calculatedRate / RATE_INCREMENT) * RATE_INCREMENT;

    setRate(Number(calculatedRate.toFixed(2)));
    setBreakdown(newBreakdown);
  }, [formData]);

  const saveProgress = useCallback(() => {
    const progress = {
      ...formData,
      step,
      rate,
      timestamp: new Date().toISOString(),
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem('locum_calculator_progress', JSON.stringify(progress));
    }
  }, [formData, step, rate]);

  useEffect(() => {
    calculateRate();
    saveProgress();
  }, [formData, calculateRate, saveProgress]);

  // Capture abandoned lead when email is entered (debounced)
  useEffect(() => {
    if (!(formData.email && !submitted)) {
      return;
    }

    const timer = setTimeout(() => {
      const abandonedData = {
        ...formData,
        rate,
        breakdown,
        abandonedAt: new Date().toISOString(),
        status: 'abandoned',
        abandonedStep: step,
      };

      fetch('/api/submit-quote', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(abandonedData),
      }).catch(error => {
        console.error('Error capturing abandoned lead:', error);
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [formData, rate, breakdown, step, submitted]);

  const handleSuburbChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedSuburb = suburbs.find(s => s.name === e.target.value);
      setFormData({
        ...formData,
        suburb: e.target.value,
        travelTime: selectedSuburb?.time || 0,
      });
    },
    [formData],
  );

  const handleSubmit = useCallback(async () => {
    const submission = {
      ...formData,
      rate,
      breakdown,
      completedAt: new Date().toISOString(),
      status: 'complete',
    };

    try {
      const response = await fetch('/api/submit-quote', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(submission),
      });

      if (response.ok) {
        setSubmitted(true);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('locum_calculator_progress');
        }
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('There was an error submitting your quote. Please email contact@locumpharmacistmelbourne.com.au directly.');
    }
  }, [formData, rate, breakdown]);

  const resetCalculator = useCallback(() => {
    setFormData({...defaultFormData});
    setStep(1);
    setRate(BASE_RATE);
    setBreakdown([{label: 'Base Rate', value: BASE_RATE}]);
    setSubmitted(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('locum_calculator_progress');
    }
  }, []);

  const totalSteps = 9;
  const progress = (step / totalSteps) * 100;

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Quote Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for your enquiry. I'll review your requirements and get back to you within 24 hours.
          </p>
          <div className="bg-blue-50 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-lg mb-2 text-blue-900">Your Estimated Rate</h3>
            <div className="text-4xl font-bold text-blue-600">${rate}/hr</div>
            <p className="text-sm text-gray-600 mt-2">Based on your pharmacy's requirements</p>
          </div>
          <p className="text-sm text-gray-500">
            A copy has been sent to <strong>{formData.email}</strong>
          </p>
          <button
            className="mt-8 inline-flex items-center justify-center rounded-full border-2 border-blue-500 px-6 py-3 text-blue-600 font-semibold hover:bg-blue-50 transition"
            onClick={resetCalculator}>
            Run another calculation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Transparent Locum Pricing</h1>
          <p className="text-gray-600">See exactly how your pharmacy's requirements affect the rate</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-green-500 h-full transition-all duration-500"
              style={{width: `${progress}%`}}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2 text-center">
            Step {step} of {totalSteps}
          </p>
        </div>

        {/* Rate Display */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-2 border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Current Estimated Rate</p>
              <div className="text-4xl font-bold text-blue-600">{formatCurrency(rate)}/hr</div>
            </div>
            <DollarSign className="w-16 h-16 text-blue-200" />
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-6 text-center">
          Typical conditions: single pharmacist cover in metropolitan Melbourne, standard community dispensary workload, and
          documented handover notes.
        </p>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {step === 1 && (
            <div>
              <Mail className="w-12 h-12 text-blue-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Let’s start with your details</h2>
              <p className="text-gray-600 mb-6">I’ll send your custom summary directly to your inbox.</p>
              <input
                className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-lg mb-4"
                onChange={e => setFormData({...formData, email: e.target.value})}
                placeholder="pharmacy@example.com"
                required
                type="email"
                value={formData.email}
              />
              <input
                className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
                onChange={e => setFormData({...formData, pharmacyName: e.target.value})}
                placeholder="Pharmacy name (optional)"
                type="text"
                value={formData.pharmacyName}
              />
            </div>
          )}

          {step === 2 && (
            <div>
              <MapPin className="w-12 h-12 text-blue-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Where and when is the shift?</h2>
              <p className="text-gray-600 mb-6">Travel time and public holidays impact the hourly rate.</p>
              <select
                className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
                onChange={handleSuburbChange}
                value={formData.suburb}>
                <option value="">Select suburb...</option>
                {suburbs.map(suburb => (
                  <option key={suburb.name} value={suburb.name}>
                    {suburb.name} {suburb.time !== null ? `(~${suburb.time} min)` : ''}
                  </option>
                ))}
              </select>
              {formData.suburb === 'Other (specify travel time)' && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Travel time from Melbourne CBD (minutes)
                  </label>
                  <input
                    className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
                    max="55"
                    min="0"
                    onChange={e =>
                      setFormData({
                        ...formData,
                        travelTime: parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="Enter travel time"
                    type="number"
                    value={formData.travelTime}
                  />
                </div>
              )}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Shift date</label>
                <input
                  className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
                  onChange={e =>
                    setFormData({
                      ...formData,
                      shiftDate: e.target.value,
                      isPublicHoliday: isPublicHoliday(e.target.value),
                    })
                  }
                  type="date"
                  value={formData.shiftDate}
                />
                {formData.isPublicHoliday && (
                  <div className="mt-2 bg-orange-50 border-l-4 border-orange-500 p-3 rounded">
                    <p className="text-sm text-orange-800">
                      ⚠️ <strong>Public Holiday Detected:</strong> 10% surcharge applies.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <Clock className="w-12 h-12 text-blue-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">How soon do you need cover?</h2>
              <p className="text-gray-600 mb-6">Shifts booked within 24 hours incur a flat $30 surcharge.</p>
              <div className="space-y-3">
                {[
                  {
                    value: 'normal',
                    title: 'More than 24 hours away',
                    description: 'Standard rate applies',
                  },
                  {
                    value: 'within24hrs',
                    title: 'Within 24 hours',
                    description: 'Short notice fee applies (+$30 flat)',
                  },
                ].map(option => (
                  <button
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                      formData.shortNotice === option.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                    }`}
                    key={option.value}
                    onClick={() => setFormData({...formData, shortNotice: option.value as 'normal' | 'within24hrs'})}>
                    <div className="font-semibold text-gray-800">{option.title}</div>
                    <div className={`text-sm ${option.value === 'within24hrs' ? 'text-orange-600' : 'text-gray-600'}`}>
                      {option.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <FileText className="w-12 h-12 text-blue-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">How many scripts per day?</h2>
              <p className="text-gray-600 mb-6">Average daily prescription volume</p>
              <div className="mb-4">
                <input
                  className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  max="300"
                  min="0"
                  onChange={e => setFormData({...formData, scriptsPerDay: parseInt(e.target.value)})}
                  step="10"
                  type="range"
                  value={formData.scriptsPerDay}
                />
                <div className="text-center mt-4">
                  <span className="text-5xl font-bold text-blue-600">{formData.scriptsPerDay}</span>
                  <span className="text-xl text-gray-600 ml-2">scripts/day</span>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <Users className="w-12 h-12 text-blue-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Tech support quality?</h2>
              <p className="text-gray-600 mb-6">Quality and number of pharmacy technicians/assistants</p>
              <div className="space-y-3">
                {[
                  {value: 'poor', label: 'Poor/No Tech', desc: 'No tech or limited capability'},
                  {value: 'average', label: 'Average Tech', desc: 'One competent technician'},
                  {value: 'good', label: 'Good Tech', desc: 'One strong technician who manages workflow well'},
                  {value: 'excellent', label: 'Excellent', desc: '2+ strong techs or tech + intern'},
                ].map(option => (
                  <button
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                      formData.techQuality === option.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    key={option.value}
                    onClick={() => setFormData({...formData, techQuality: option.value})}>
                    <div className="font-semibold text-gray-800">{option.label}</div>
                    <div className="text-sm text-gray-600">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 6 && (
            <div>
              <Pill className="w-12 h-12 text-blue-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">OST volume?</h2>
              <p className="text-gray-600 mb-6">Opiate Substitution Therapy doses per day</p>
              <div className="space-y-3">
                {[
                  {value: 'none', label: 'None', desc: 'No OST patients'},
                  {value: 'medium', label: '5-20 per day', desc: 'Moderate OST load'},
                  {value: 'high', label: 'More than 20 per day', desc: 'High OST volume'},
                ].map(option => (
                  <button
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                      formData.ostVolume === option.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    key={option.value}
                    onClick={() => setFormData({...formData, ostVolume: option.value})}>
                    <div className="font-semibold text-gray-800">{option.label}</div>
                    <div className="text-sm text-gray-600">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 7 && (
            <div>
              <FileText className="w-12 h-12 text-blue-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">DAA complexity?</h2>
              <p className="text-gray-600 mb-6">Dose Administration Aid packing requirements</p>
              <div className="space-y-3">
                {[
                  {value: 'stable', label: 'Stable Packs', desc: 'Mostly routine packing, minimal changes'},
                  {value: 'moderate', label: 'Moderate Changes', desc: 'Regular medication changes and updates'},
                  {value: 'complex', label: 'High Maintenance', desc: 'Frequent changes, complex regimens'},
                ].map(option => (
                  <button
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                      formData.daaComplexity === option.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    key={option.value}
                    onClick={() => setFormData({...formData, daaComplexity: option.value})}>
                    <div className="font-semibold text-gray-800">{option.label}</div>
                    <div className="text-sm text-gray-600">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 8 && (
            <div>
              <Beaker className="w-12 h-12 text-blue-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Compounding requirements?</h2>
              <p className="text-gray-600 mb-6">Extemporaneous preparation complexity</p>
              <div className="space-y-3">
                {[
                  {value: 'none', label: 'None/Simple', desc: 'No compounding or basic creams only'},
                  {value: 'regular', label: 'Regular Compounding', desc: 'Creams and simple extemporaneous preparations'},
                  {value: 'complex', label: 'Complex Compounding', desc: 'Capsules, suspensions, complex formulations'},
                ].map(option => (
                  <button
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                      formData.compounding === option.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    key={option.value}
                    onClick={() => setFormData({...formData, compounding: option.value})}>
                    <div className="font-semibold text-gray-800">{option.label}</div>
                    <div className="text-sm text-gray-600">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 9 && (
            <div>
              <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Quote Summary</h2>

              <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 mb-6">
                <div className="text-center mb-4">
                  <div className="text-sm text-gray-600 mb-1">Estimated Hourly Rate</div>
                  <div className="text-5xl font-bold text-blue-600">{formatCurrency(rate)}/hr</div>
                  {formData.shiftHours && (
                    <div className="mt-3 text-gray-700">
                      <p className="text-sm text-gray-600">
                        For a {formData.shiftHours} hour shift:
                        <span className="font-semibold text-gray-900 ml-2">
                          {formatCurrency(rate * Number(formData.shiftHours))}
                        </span>
                        {formData.shortNotice === 'within24hrs' && (
                          <span className="ml-2">
                            + $30 ={' '}
                            <span className="font-semibold text-gray-900">
                              {formatCurrency(rate * Number(formData.shiftHours) + 30)}
                            </span>
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-300 pt-4">
                  <h3 className="font-semibold text-gray-800 mb-3">Rate Breakdown</h3>
                  <div className="space-y-2">
                    {breakdown.map((item, idx) => (
                      <div className="flex justify-between text-sm" key={idx}>
                        <span className="text-gray-600">{item.label}</span>
                        <span
                          className={`font-semibold ${
                            item.value > 0 ? 'text-green-600' : item.value < 0 ? 'text-blue-600' : 'text-gray-800'
                          }`}>
                          {item.isFlat
                            ? `+$${item.value}`
                            : item.value === 0
                              ? ''
                              : `${item.value > 0 ? '+' : '-'}${formatCurrency(Math.abs(item.value))}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 rounded">
                <p className="text-sm text-yellow-800">
                  💼 <strong>Note:</strong> This rate already includes GST and superannuation is not required as I operate as
                  an independent contractor.
                </p>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded">
                <p className="text-sm text-blue-800">
                  📅 <strong>Booking multiple shifts?</strong> A 10% multi-shift discount applies to 3+ confirmed shifts (8+
                  hours each). Mention it in your enquiry.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Planned shift length (hours)</label>
                  <input
                    className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    min="4"
                    onChange={e => setFormData({...formData, shiftHours: e.target.value})}
                    placeholder="e.g. 8"
                    type="number"
                    value={formData.shiftHours}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number (optional)</label>
                  <input
                    className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    placeholder="0412 345 678"
                    type="tel"
                    value={formData.phone}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Contact Method</label>
                  <select
                    className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    onChange={e => setFormData({...formData, contactPreference: e.target.value})}
                    value={formData.contactPreference}>
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="either">Either</option>
                  </select>
                </div>
              </div>

              <button
                className="w-full mt-6 bg-gradient-to-r from-blue-500 to-green-500 text-white font-semibold py-4 px-6 rounded-lg hover:from-blue-600 hover:to-green-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!formData.email}
                onClick={handleSubmit}>
                Submit Quote Request
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                By submitting, you agree to be contacted about locum pharmacist services
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:border-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              disabled={step === 1}
              onClick={() => setStep(Math.max(1, step - 1))}>
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>

            {step < 9 && (
              <button
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-green-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                disabled={
                  (step === 1 && !formData.email) ||
                  (step === 2 && !formData.suburb) ||
                  (step === 5 && !formData.techQuality) ||
                  (step === 6 && !formData.ostVolume) ||
                  (step === 7 && !formData.daaComplexity) ||
                  (step === 8 && !formData.compounding)
                }
                onClick={() => {
                  if (step === 1 && !formData.email) {
                    alert('Please enter your email to continue');
                    return;
                  }
                  if (step === 2 && !formData.suburb) {
                    alert('Please select a suburb to continue');
                    return;
                  }
                  setStep(step + 1);
                }}>
                Continue
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

PricingCalculator.displayName = 'PricingCalculator';
export default PricingCalculator;

