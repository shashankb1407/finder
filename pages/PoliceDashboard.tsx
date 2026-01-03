
import React, { useState, useMemo } from 'react';
import { MissingPerson, StatusHistory, Tip, CaseStatus, TipStatus, UserRole } from '../types';
// Added missing 'Users' import from lucide-react
import { 
  Plus, Search, Edit2, Trash2, Filter, 
  ChevronDown, History, MessageSquare, 
  MapPin, CheckCircle, XCircle, Clock,
  Upload, User, Eye, BrainCircuit, Camera,
  ScanSearch, AlertCircle, Check, ArrowRight, ShieldAlert,
  Fingerprint, RefreshCcw, Users
} from 'lucide-react';
import { findFaceMatches } from '../services/geminiService';

interface Props {
  cases: MissingPerson[];
  history: StatusHistory[];
  tips: Tip[];
  onAddCase: (c: MissingPerson) => void;
  onUpdateCase: (id: string, status: CaseStatus) => void;
  onDeleteCase: (id: string) => void;
  onUpdateTip: (tipId: string, status: TipStatus) => void;
}

const PoliceDashboard: React.FC<Props> = ({ 
  cases, history, tips, onAddCase, onUpdateCase, onDeleteCase, onUpdateTip 
}) => {
  const [activeTab, setActiveTab] = useState<'cases' | 'tips' | 'history'>('cases');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const [matchResults, setMatchResults] = useState<any[]>([]);
  const [matchPhoto, setMatchPhoto] = useState<string | null>(null);
  const [hasPerformedSearch, setHasPerformedSearch] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    gender: 'Male',
    lastSeenLocation: '',
    dateMissing: '',
    description: '',
    photo: ''
  });

  const filteredCases = cases.filter(c => 
    c.fullName.toLowerCase().includes(search.toLowerCase()) || 
    c.lastSeenLocation.toLowerCase().includes(search.toLowerCase())
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, photo: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleMatchPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMatchPhoto(reader.result as string);
        setHasPerformedSearch(false);
        setMatchResults([]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCase: MissingPerson = {
      id: Math.random().toString(36).substr(2, 9),
      fullName: formData.fullName,
      age: parseInt(formData.age),
      gender: formData.gender,
      lastSeenLocation: formData.lastSeenLocation,
      dateMissing: formData.dateMissing,
      dateReported: new Date().toISOString(),
      description: formData.description,
      photoBase64: formData.photo,
      status: CaseStatus.MISSING,
      reportedBy: 'OFFICER_ADMIN'
    };
    onAddCase(newCase);
    setShowAddModal(false);
    setFormData({ fullName: '', age: '', gender: 'Male', lastSeenLocation: '', dateMissing: '', description: '', photo: '' });
  };

  const executeFaceMatch = async () => {
    if (!matchPhoto) return;
    setIsMatching(true);
    setHasPerformedSearch(true);
    setMatchResults([]);
    try {
      const results = await findFaceMatches(matchPhoto, cases);
      setMatchResults(results);
    } catch (error) {
      console.error("Match error:", error);
      alert("AI matching service is currently unavailable.");
    } finally {
      setIsMatching(false);
    }
  };

  const handleMatchAIFromTip = async (tip: Tip) => {
    if (!tip.photoBase64) return;
    setMatchPhoto(tip.photoBase64);
    setShowMatchModal(true);
    setIsMatching(true);
    setHasPerformedSearch(true);
    const results = await findFaceMatches(tip.photoBase64, cases);
    setMatchResults(results);
    setIsMatching(false);
  };

  // Filter results by confidence > 50%
  const validMatches = useMemo(() => {
    return (matchResults || [])
      .filter(r => r.confidence > 0.5)
      .sort((a, b) => b.confidence - a.confidence);
  }, [matchResults]);

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Department Control Panel</h1>
          <p className="text-slate-500 font-medium">Advanced monitoring and case management suite.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => {
              setMatchPhoto(null);
              setMatchResults([]);
              setHasPerformedSearch(false);
              setShowMatchModal(true);
            }}
            className="bg-white text-blue-600 border border-blue-200 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-50 transition-all shadow-sm"
          >
            <Fingerprint size={20} /> AI Identification
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all"
          >
            <Plus size={20} /> Register Case
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('cases')}
          className={`px-6 py-4 font-bold transition-all border-b-2 ${activeTab === 'cases' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          Case Files ({cases.length})
        </button>
        <button 
          onClick={() => setActiveTab('tips')}
          className={`px-6 py-4 font-bold transition-all border-b-2 ${activeTab === 'tips' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          Sightings & Tips ({tips.length})
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`px-6 py-4 font-bold transition-all border-b-2 ${activeTab === 'history' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          Audit History
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden min-h-[500px]">
        {activeTab === 'cases' && (
          <div className="p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search database by name, location, or case ID..." 
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b">
                    <th className="px-4 py-4">Subject Profile</th>
                    <th className="px-4 py-4">Current Status</th>
                    <th className="px-4 py-4">Last Coordinates</th>
                    <th className="px-4 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredCases.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-4 py-5">
                        <div className="flex items-center gap-4">
                          <img src={c.photoBase64 || `https://picsum.photos/seed/${c.id}/100/100`} className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-50 shadow-sm" />
                          <div>
                            <p className="font-bold text-slate-800 text-base">{c.fullName}</p>
                            <p className="text-xs font-semibold text-slate-400 uppercase">{c.age} Yrs • {c.gender}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-5">
                        <select 
                          value={c.status}
                          onChange={(e) => onUpdateCase(c.id, e.target.value as CaseStatus)}
                          className={`text-[10px] font-black px-3 py-1.5 rounded-lg uppercase cursor-pointer border-none focus:ring-0 ${
                            c.status === CaseStatus.MISSING ? 'bg-amber-100 text-amber-700' :
                            c.status === CaseStatus.FOUND ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          <option value={CaseStatus.MISSING}>Missing</option>
                          <option value={CaseStatus.UNDER_INVESTIGATION}>Investigating</option>
                          <option value={CaseStatus.FOUND}>Found</option>
                        </select>
                      </td>
                      <td className="px-4 py-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-700">{c.lastSeenLocation}</span>
                          <span className="text-[10px] text-slate-400 font-medium">{new Date(c.dateMissing).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="px-4 py-5 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors bg-white hover:bg-blue-50 rounded-xl" title="Edit Case">
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => onDeleteCase(c.id)}
                            className="p-2 text-slate-400 hover:text-red-600 transition-colors bg-white hover:bg-red-50 rounded-xl" 
                            title="Delete Case"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredCases.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-24 text-center">
                        <Search size={48} className="mx-auto text-slate-200 mb-4" />
                        <p className="text-slate-400 font-bold italic">No matching records found in central database.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'tips' && (
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tips.map(t => (
                <div key={t.id} className="bg-slate-50 border-2 border-slate-100 rounded-[2rem] p-6 space-y-4">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 shrink-0 bg-white rounded-2xl overflow-hidden border shadow-sm relative group">
                      {t.photoBase64 ? (
                        <img src={t.photoBase64} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <Camera size={24} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className="font-black text-slate-800 text-lg leading-tight truncate">Sighting: {t.personName}</h4>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter ${
                          t.status === TipStatus.VERIFIED ? 'bg-green-100 text-green-700' : 
                          t.status === TipStatus.REJECTED ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {t.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-bold flex items-center gap-1 mt-1">
                        <MapPin size={12} className="text-blue-500" /> {t.seenLocation}
                      </p>
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">{t.dateTime}</p>
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-2xl border border-slate-100">
                    <p className="text-slate-600 text-xs italic leading-relaxed">"{t.description}"</p>
                  </div>
                  
                  <div className="flex items-center gap-2 pt-2">
                    <button 
                      onClick={() => onUpdateTip(t.id, TipStatus.VERIFIED)}
                      className="flex-1 py-3 bg-green-600 text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-green-700 transition-all shadow-md shadow-green-100"
                    >
                      Verify
                    </button>
                    <button 
                      onClick={() => onUpdateTip(t.id, TipStatus.REJECTED)}
                      className="flex-1 py-3 bg-white text-red-600 border border-red-100 text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-red-50 transition-all"
                    >
                      Reject
                    </button>
                    {t.photoBase64 && (
                      <button 
                        onClick={() => handleMatchAIFromTip(t)}
                        className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
                        title="Run Identification"
                      >
                        <BrainCircuit size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {tips.length === 0 && <p className="col-span-full text-center text-slate-400 py-24 font-bold italic">Operational status clear. No pending tips.</p>}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="p-8">
            <div className="max-w-3xl mx-auto space-y-4">
              {history.map((h) => (
                <div key={h.id} className="relative pl-10 pb-8 last:pb-0">
                  <div className="absolute left-0 top-0 w-[2px] h-full bg-slate-100"></div>
                  <div className="absolute left-[-5px] top-1 w-3 h-3 rounded-full bg-blue-600 ring-4 ring-white shadow-sm"></div>
                  <div className="bg-slate-50/50 p-5 rounded-[1.5rem] border-2 border-slate-50 group hover:border-blue-100 transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-black text-slate-800 text-base">{h.personName}</h4>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{h.updatedAt}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-slate-400 bg-white px-3 py-1 rounded-lg uppercase border border-slate-100 line-through decoration-slate-300 decoration-2">
                        {h.previousStatus}
                      </span>
                      <ArrowRight size={14} className="text-slate-300" />
                      <span className={`text-[10px] font-black px-3 py-1 rounded-lg uppercase shadow-sm ${
                        h.updatedStatus === CaseStatus.FOUND ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'
                      }`}>
                        {h.updatedStatus}
                      </span>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center">
                        <User size={10} className="text-slate-500" />
                      </div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Authorized Officer: {h.updatedBy}</p>
                    </div>
                  </div>
                </div>
              ))}
              {history.length === 0 && <p className="text-center text-slate-400 py-24 font-bold italic">Logs initialized. No activity records found.</p>}
            </div>
          </div>
        )}
      </div>

      {/* AI Face Match Modal */}
      {showMatchModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-lg animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-5xl shadow-[0_0_100px_rgba(37,99,235,0.2)] overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-500 border border-white/20">
            <div className="bg-slate-900 p-8 text-white flex justify-between items-center sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/30">
                  <Fingerprint size={32} className={isMatching ? "animate-pulse" : ""} />
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-tight leading-none mb-1">Advanced Biometric Analysis</h3>
                  <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">Forensic Matching Module v3.1</p>
                </div>
              </div>
              <button onClick={() => setShowMatchModal(false)} className="hover:bg-white/10 p-2 rounded-2xl transition-all">
                <XCircle size={32} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-10 grid grid-cols-1 lg:grid-cols-12 gap-12">
              {/* Left Column: Input Sighting */}
              <div className="lg:col-span-5 space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Camera size={16} /> Evidence Input
                    </h4>
                    {matchPhoto && (
                      <button 
                        onClick={() => { setMatchPhoto(null); setHasPerformedSearch(false); }}
                        className="text-[10px] font-black text-red-500 uppercase hover:underline flex items-center gap-1"
                      >
                        <RefreshCcw size={10} /> Clear
                      </button>
                    )}
                  </div>
                  
                  <div className="relative group">
                    <label className="cursor-pointer bg-slate-50 hover:bg-slate-100 p-8 rounded-[2rem] border-4 border-dashed border-slate-200 transition-all flex flex-col items-center justify-center text-slate-400 min-h-[400px] overflow-hidden group relative">
                      {matchPhoto ? (
                        <div className="w-full h-full relative">
                          <img src={matchPhoto} className="w-full h-full object-contain rounded-xl" />
                          <div className="absolute inset-0 bg-blue-600/10 mix-blend-overlay"></div>
                          <div className="absolute top-0 left-0 w-full h-0.5 bg-blue-500/50 shadow-[0_0_15px_blue] animate-[scan_3s_linear_infinite]"></div>
                        </div>
                      ) : (
                        <>
                          <div className="bg-white p-6 rounded-[2rem] shadow-xl mb-6 group-hover:scale-110 transition-transform duration-500">
                            <Upload size={40} className="text-blue-600" />
                          </div>
                          <span className="text-lg font-black text-slate-800">Drop Evidence Photo</span>
                          <span className="text-xs mt-2 text-slate-500 font-bold uppercase tracking-tight">High resolution forensic input</span>
                        </>
                      )}
                      <input type="file" className="hidden" accept="image/*" onChange={handleMatchPhotoUpload} />
                    </label>
                  </div>
                  
                  {matchPhoto && (
                    <button 
                      onClick={executeFaceMatch}
                      disabled={isMatching}
                      className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-2xl ${isMatching ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/40'}`}
                    >
                      {isMatching ? (
                        <>
                          <div className="w-5 h-5 border-4 border-slate-300 border-t-blue-500 rounded-full animate-spin"></div>
                          Processing Biometrics...
                        </>
                      ) : (
                        <>
                          <ScanSearch size={22} /> Initiate Cross-Reference
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Right Column: Comparison Results */}
              <div className="lg:col-span-7 space-y-8">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Users size={16} /> Database Matches (50%+)
                </h4>
                
                <div className="space-y-6">
                  {!isMatching && hasPerformedSearch ? (
                    validMatches.length > 0 ? (
                      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {validMatches.map((result: any) => {
                          const person = cases.find(c => c.id === result.id);
                          if (!person) return null;
                          const confidencePercent = Math.round(result.confidence * 100);
                          
                          return (
                            <div key={result.id} className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-6 shadow-sm hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/5 transition-all group/match">
                              <div className="flex gap-6">
                                <div className="w-28 h-28 rounded-2xl overflow-hidden shrink-0 border-4 border-slate-50 relative group-hover/match:scale-105 transition-transform duration-500">
                                  <img src={person.photoBase64 || `https://picsum.photos/seed/${person.id}/150/150`} className="w-full h-full object-cover" />
                                  <div className={`absolute inset-0 border-4 ${confidencePercent > 80 ? 'border-green-500/50' : 'border-blue-500/50'} pointer-events-none`}></div>
                                  <div className={`absolute bottom-0 right-0 p-1.5 rounded-tl-xl shadow-lg ${confidencePercent > 80 ? 'bg-green-600' : 'bg-blue-600'} text-white`}>
                                    <Check size={14} />
                                  </div>
                                </div>
                                <div className="flex-1 space-y-3">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <p className="font-black text-slate-800 text-xl tracking-tight leading-none mb-1">{person.fullName}</p>
                                      <div className="flex gap-2">
                                        <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-0.5 rounded uppercase">{person.age} Yrs</span>
                                        <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-0.5 rounded uppercase">{person.gender}</span>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className={`text-3xl font-black tabular-nums leading-none ${confidencePercent > 80 ? 'text-green-600' : 'text-blue-600'}`}>
                                        {confidencePercent}%
                                      </div>
                                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5">Confidence</p>
                                    </div>
                                  </div>
                                  
                                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                                    <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                                      <span className="text-blue-600 font-black mr-2">LOGIC:</span> 
                                      {result.reason}
                                    </p>
                                  </div>

                                  <button 
                                    onClick={() => {
                                      setShowMatchModal(false);
                                      setActiveTab('cases');
                                      setSearch(person.fullName);
                                    }}
                                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-800 transition-colors group/btn"
                                  >
                                    Inspect Full Archive <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="py-24 flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-200 text-center px-12 animate-in zoom-in duration-500">
                        <div className="bg-white p-6 rounded-[2rem] shadow-2xl mb-6">
                          <ShieldAlert size={64} className="text-red-500" />
                        </div>
                        <p className="text-2xl font-black text-slate-800 tracking-tight">Zero Matches Detected</p>
                        <p className="text-sm mt-3 leading-relaxed font-medium text-slate-500 max-w-sm">No forensic matches above 50% confidence found in the active missing persons registry. Verify evidence photo clarity or re-scan.</p>
                        <div className="mt-8 flex gap-3">
                           <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-400 uppercase">Searched {cases.length} records</div>
                        </div>
                      </div>
                    )
                  ) : isMatching ? (
                    <div className="py-32 flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-200 overflow-hidden relative">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.05)_0,transparent_100%)]"></div>
                      <div className="relative mb-8">
                        <div className="w-24 h-24 border-[6px] border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                        <BrainCircuit className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600" size={40} />
                      </div>
                      <p className="text-xl font-black text-slate-800 animate-pulse tracking-tight">Biometric Deep-Scan In Progress</p>
                      <p className="text-[10px] mt-3 text-slate-400 uppercase tracking-[0.3em] font-black">Comparing structural facial markers</p>
                    </div>
                  ) : (
                    <div className="py-32 flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-200 text-center px-12">
                      <div className="bg-white p-6 rounded-[2rem] shadow-md mb-6 opacity-30">
                        <Fingerprint size={64} className="text-slate-300" />
                      </div>
                      <p className="text-sm font-black text-slate-500 uppercase tracking-widest">Awaiting Identification Request</p>
                      <p className="text-xs mt-2 max-w-xs font-medium leading-relaxed">System initialized. Upload biometric evidence to begin forensic matching against active missing person database.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="bg-slate-50 p-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <ShieldAlert size={20} className="text-amber-500" />
                <div className="text-left">
                  <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest leading-none mb-1">Authenticated Forensic Output</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">Identification via AI reasoning & visual data cross-reference.</p>
                </div>
              </div>
              <p className="text-[9px] text-slate-400 max-w-md text-center md:text-right leading-relaxed font-medium">
                Note: AI matching provides investigative leads based on multi-modal reasoning. Results must be legally validated by an authorized medical examiner or witness.
              </p>
            </div>
          </div>
          <style>{`
            @keyframes scan {
              0% { transform: translateY(0); }
              100% { transform: translateY(400px); }
            }
          `}</style>
        </div>
      )}

      {/* Add Case Modal (existing UI) */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
            <div className="bg-blue-600 p-8 text-white flex justify-between items-center sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <Plus size={28} />
                <h3 className="text-2xl font-black tracking-tight">New Case Registration</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="hover:bg-blue-500 p-2 rounded-2xl transition-all">
                <XCircle size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Identity</label>
                  <input 
                    type="text" 
                    required 
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl transition-all outline-none text-slate-800 font-bold"
                    placeholder="Subject Name"
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Age Record</label>
                  <input 
                    type="number" 
                    required 
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl transition-all outline-none text-slate-800 font-bold"
                    placeholder="Current Age"
                    value={formData.age}
                    onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gender</label>
                  <select 
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl transition-all outline-none text-slate-800 font-bold"
                    value={formData.gender}
                    onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Last Contact Point</label>
                  <input 
                    type="text" 
                    required 
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl transition-all outline-none text-slate-800 font-bold"
                    placeholder="Location"
                    value={formData.lastSeenLocation}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastSeenLocation: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Disappearance Date</label>
                  <input 
                    type="date" 
                    required 
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl transition-all outline-none text-slate-800 font-bold"
                    value={formData.dateMissing}
                    onChange={(e) => setFormData(prev => ({ ...prev, dateMissing: e.target.value }))}
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Physical Profile / Marks</label>
                  <textarea 
                    rows={3} 
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl transition-all outline-none text-slate-800 font-bold"
                    placeholder="Tattoos, scars, clothing last worn..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div className="md:col-span-2 space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Primary Archive Photo</label>
                  <div className="flex items-center gap-6">
                    <label className="flex-1 cursor-pointer bg-slate-50 hover:bg-slate-100 p-10 rounded-[2rem] border-4 border-dashed border-slate-200 transition-all flex flex-col items-center justify-center text-slate-400">
                      <Upload size={32} />
                      <span className="text-[10px] mt-2 font-black uppercase tracking-widest">Upload Master Reference</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                    </label>
                    {formData.photo && (
                      <div className="w-40 h-40">
                        <img src={formData.photo} className="w-full h-full object-cover rounded-[2rem] shadow-2xl border-4 border-white" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-blue-600 text-white text-sm font-black uppercase tracking-widest py-5 rounded-2xl hover:bg-blue-700 transition-all shadow-2xl shadow-blue-500/30"
              >
                Establish Case Record
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PoliceDashboard;
