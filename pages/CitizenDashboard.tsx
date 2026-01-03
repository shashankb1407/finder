
import React, { useState, useMemo } from 'react';
import { MissingPerson, Tip, CaseStatus, TipStatus } from '../types';
import { Search, MapPin, Calendar, Clock, Info, Camera, Send, X } from 'lucide-react';

interface Props {
  cases: MissingPerson[];
  onAddTip: (tip: Tip) => void;
}

const CitizenDashboard: React.FC<Props> = ({ cases, onAddTip }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [selectedCase, setSelectedCase] = useState<MissingPerson | null>(null);
  
  // Tip Form State
  const [showTipForm, setShowTipForm] = useState(false);
  const [tipLocation, setTipLocation] = useState('');
  const [tipDescription, setTipDescription] = useState('');
  const [tipPhoto, setTipPhoto] = useState<string | null>(null);

  const activeCases = cases.filter(c => c.status !== CaseStatus.FOUND);
  const filteredCases = activeCases.filter(c => {
    const matchesSearch = c.fullName.toLowerCase().includes(search.toLowerCase()) || 
                          c.lastSeenLocation.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const recentlyReported = useMemo(() => {
    return [...cases].sort((a, b) => new Date(b.dateReported).getTime() - new Date(a.dateReported).getTime()).slice(0, 5);
  }, [cases]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setTipPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitTip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;

    const newTip: Tip = {
      id: Math.random().toString(36).substr(2, 9),
      caseId: selectedCase.id,
      personName: selectedCase.fullName,
      seenLocation: tipLocation,
      dateTime: new Date().toLocaleString(),
      description: tipDescription,
      photoBase64: tipPhoto || undefined,
      status: TipStatus.PENDING,
      submittedAt: new Date().toISOString()
    };

    onAddTip(newTip);
    alert('Thank you. Your tip has been submitted securely to the authorities.');
    setShowTipForm(false);
    setTipLocation('');
    setTipDescription('');
    setTipPhoto(null);
  };

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-8 overflow-hidden relative">
        <div className="flex-1 space-y-6 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-semibold">
            <Info size={16} /> Public Safety Portal
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight">
            Help Us Find <span className="text-blue-600">Them.</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-xl">
            Every second counts. Browse active cases and report sightings to help our officers bring missing individuals home safely.
          </p>
          <div className="relative max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by name, location, or details..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl shadow-inner focus:outline-none transition-all text-lg"
            />
          </div>
        </div>
        <div className="flex-1 flex justify-center z-10">
          <img src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=800" alt="Awareness" className="rounded-2xl shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500 max-w-full h-auto" />
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
      </section>

      {/* Recently Reported */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Clock className="text-blue-600" /> Recently Reported
          </h2>
          <span className="text-slate-400 text-sm font-medium">Last updated: Just now</span>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {recentlyReported.map(c => (
            <div key={c.id} className="min-w-[280px] bg-white rounded-2xl p-4 shadow-sm border border-slate-100 relative group">
              <div className="absolute top-4 left-4 z-10 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest animate-pulse">
                New Case
              </div>
              <img src={c.photoBase64 || `https://picsum.photos/seed/${c.id}/300/300`} className="w-full h-40 object-cover rounded-xl mb-4 group-hover:scale-[1.02] transition-transform" alt={c.fullName} />
              <h3 className="font-bold text-slate-800">{c.fullName}</h3>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                <MapPin size={12} /> {c.lastSeenLocation}
              </p>
              <div className="mt-3 flex justify-between items-center">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${c.status === CaseStatus.FOUND ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {c.status}
                </span>
                <span className="text-[10px] text-slate-400 italic">Reported {new Date(c.dateReported).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
          {recentlyReported.length === 0 && <p className="text-slate-400 italic">No recent reports available.</p>}
        </div>
      </section>

      {/* Main Case List */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Active Investigations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCases.map(c => (
            <div key={c.id} className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all group flex flex-col border border-slate-100">
              <div className="relative h-64">
                <img 
                  src={c.photoBase64 || `https://picsum.photos/seed/${c.id}/400/500`} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  alt={c.fullName}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute bottom-4 left-4 text-white opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                  <p className="text-sm font-medium">{c.age} Years • {c.gender}</p>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-slate-800">{c.fullName}</h3>
                <div className="mt-2 space-y-1">
                  <p className="text-slate-500 text-sm flex items-start gap-1">
                    <MapPin size={16} className="text-blue-500 shrink-0 mt-0.5" />
                    <span>{c.lastSeenLocation}</span>
                  </p>
                  <p className="text-slate-500 text-sm flex items-center gap-1">
                    <Calendar size={16} className="text-blue-500" />
                    <span>Missing since {new Date(c.dateMissing).toLocaleDateString()}</span>
                  </p>
                </div>
                <p className="mt-4 text-sm text-slate-600 line-clamp-2 italic">"{c.description}"</p>
                
                <button 
                  onClick={() => {
                    setSelectedCase(c);
                    setShowTipForm(true);
                  }}
                  className="mt-6 w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-100 flex items-center justify-center gap-2 group/btn"
                >
                  <Send size={18} className="group-hover/btn:translate-x-1 transition-transform" /> Submit A Sighting
                </button>
              </div>
            </div>
          ))}
          {filteredCases.length === 0 && (
            <div className="col-span-full py-12 text-center bg-white rounded-3xl border border-dashed border-slate-300">
              <p className="text-slate-400 text-lg italic">No cases match your search criteria.</p>
            </div>
          )}
        </div>
      </section>

      {/* Tip Submission Modal */}
      {showTipForm && selectedCase && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">Submit a Sighting Tip</h3>
                <p className="text-blue-100 text-sm">For Case ID: #{selectedCase.id.toUpperCase()}</p>
              </div>
              <button onClick={() => setShowTipForm(false)} className="p-2 hover:bg-blue-500 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmitTip} className="p-8 space-y-6">
              <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <img src={selectedCase.photoBase64 || `https://picsum.photos/seed/${selectedCase.id}/100/100`} className="w-16 h-16 rounded-xl object-cover" />
                <div>
                  <p className="font-bold text-slate-800">{selectedCase.fullName}</p>
                  <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider">Help identify this person</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Where did you see them?</label>
                  <input 
                    type="text" 
                    placeholder="E.g. Main St Station, Near the cafe"
                    value={tipLocation}
                    onChange={(e) => setTipLocation(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Description / Observations</label>
                  <textarea 
                    rows={3}
                    placeholder="What were they wearing? Who were they with?"
                    value={tipDescription}
                    onChange={(e) => setTipDescription(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Snapshot (Optional)</label>
                  <div className="flex items-center gap-4">
                    <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 p-8 rounded-2xl border-2 border-dashed border-slate-300 transition-colors flex-1 flex flex-col items-center justify-center text-slate-400">
                      <Camera size={32} />
                      <span className="text-xs mt-2 font-medium">Upload Image</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                    {tipPhoto && (
                      <div className="relative w-32 h-32">
                        <img src={tipPhoto} className="w-full h-full object-cover rounded-2xl" />
                        <button 
                          type="button" 
                          onClick={() => setTipPhoto(null)} 
                          className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-md"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
              >
                Send Secure Report
              </button>
              <p className="text-center text-xs text-slate-400">Your identity will remain confidential unless required by law.</p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CitizenDashboard;
