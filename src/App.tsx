import * as React from 'react';
import { useState, useEffect, Component } from 'react';
import { TrendingUp, LogOut, ChevronDown, Globe, Clock, BarChart3, MessageSquare, CreditCard, AlertTriangle, ShieldAlert, Target, AlertCircle, TrendingDown, Activity, Info, Plus, Trash2, Edit2, Save, X, User, Key, Calendar, Timer, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { db, auth } from './firebase';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, onSnapshot, query, where, Timestamp, getDocFromServer, orderBy } from 'firebase/firestore';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User as FirebaseUser } from 'firebase/auth';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

// Error Boundary Component
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0f0a1a] flex items-center justify-center p-6 text-center">
          <div className="bg-[#1a1625] border border-red-500/20 p-10 rounded-[3rem] max-w-lg shadow-2xl">
            <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h2 className="text-2xl font-black text-white mb-4 uppercase italic tracking-tighter">System Error Detected</h2>
            <p className="text-neutral-500 mb-8 font-medium">The application encountered an unexpected error. {this.state.error?.message || "Unknown error"}</p>
            <button 
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-red-600/20"
            >
              RESET & REPAIR APP
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const BROKERS = ["Binance", "Quotex", "Forex"];
const DEFAULT_PAIRS = [
  "EUR/USD", "GBP/JPY", "USD/CHF", "XAU/USD", "AUD/USD", "USD/JPY", "EUR/GBP", "USD/CAD",
  "NZD/USD", "GBP/USD", "EUR/JPY", "AUD/JPY", "USD/TRY", "USD/MXN", "USD/ZAR", "BTC/USD",
  "EUR/USD (OTC)", "GBP/USD (OTC)", "USD/JPY (OTC)", "AUD/USD (OTC)", "EUR/JPY (OTC)"
];
const TIMEFRAMES = ["5s", "10s", "1m", "2m", "3m", "5m"];

function MWLogo() {
  return (
    <div className="flex flex-col items-center justify-center mb-10">
      {/* White Outer Circle ("White Circulation") */}
      <div className="w-52 h-52 rounded-full bg-white flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
        {/* Main Logo Container */}
        <div className="w-[92%] h-[92%] rounded-full bg-[#121212] flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
          
          {/* Chart Elements Container */}
          <div className="relative w-full h-20 flex items-end justify-center px-6 mb-1">
            
            {/* Candlesticks */}
            <div className="flex items-end gap-2.5 relative z-10 mb-2">
              {/* Stick 1 */}
              <div className="w-2.5 h-6 bg-[#22c55e] rounded-[1px] relative">
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-[1.5px] h-1.5 bg-[#22c55e]" />
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-[1.5px] h-1.5 bg-[#22c55e]" />
              </div>
              {/* Stick 2 */}
              <div className="w-2.5 h-10 bg-[#22c55e] rounded-[1px] relative">
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-[1.5px] h-2 bg-[#22c55e]" />
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-[1.5px] h-1.5 bg-[#22c55e]" />
              </div>
              {/* Stick 3 */}
              <div className="w-2.5 h-8 bg-[#22c55e] rounded-[1px] relative">
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-[1.5px] h-1.5 bg-[#22c55e]" />
                <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-[1.5px] h-2.5 bg-[#22c55e]" />
              </div>
              {/* Stick 4 */}
              <div className="w-2.5 h-14 bg-[#22c55e] rounded-[1px] relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-[1.5px] h-3 bg-[#22c55e]" />
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-[1.5px] h-1.5 bg-[#22c55e]" />
              </div>
            </div>

            {/* Trend Line SVG - Matching the image path exactly */}
            <svg className="absolute inset-0 w-full h-full z-20 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
              <motion.path
                d="M 15 70 L 32 55 L 42 65 L 55 40 L 68 50 L 85 22"
                fill="none"
                stroke="#22c55e"
                strokeWidth="4.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
              {/* Arrow Head */}
              <motion.path
                d="M 76 28 L 85 22 L 82 34"
                fill="none"
                stroke="#22c55e"
                strokeWidth="4.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              />
            </svg>
          </div>

          {/* Text Elements - Bold and High Contrast */}
          <div className="flex flex-col items-center -mt-2 relative z-30">
            <h1 className="text-[4.2rem] font-[1000] text-white tracking-[-0.05em] leading-[0.85]">MW</h1>
            <p className="text-[1.35rem] font-black text-white tracking-[0.32em] uppercase mt-1.5">Trader</p>
          </div>

          {/* Subtle texture/gradient for a professional finish */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
        </div>
      </div>
    </div>
  );
}

function WarningBox() {
  return (
    <div className="border-2 border-yellow-500 bg-neutral-900/40 backdrop-blur-sm p-4 rounded-2xl text-center mb-10 mx-auto max-w-[90%]">
      <p className="text-[13px] font-bold text-white leading-relaxed">
        I am not a financial advisor. Risk management is essential.
      </p>
    </div>
  );
}

interface DetailedSignal {
  trend: 'Bullish' | 'Bearish' | 'Neutral' | string;
  entry: string;
  tp: string;
  sl: string;
  ratio: string;
  analysis: string;
  conditions: string;
  price: number;
}

interface TokenData {
  id: string;
  createdAt: any;
  expiresAt: any;
  status: 'active' | 'expired';
  label?: string;
}

function TokenTimer({ expiresAt }: { expiresAt: any }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calculateTime = () => {
      const expiry = expiresAt instanceof Timestamp ? expiresAt.toDate() : new Date(expiresAt);
      const now = new Date();
      const diff = expiry.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft("EXPIRED");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${days}d ${hours}h ${mins}m ${secs}s`);
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [expiresAt]);

  return (
    <div className="bg-purple-600/10 border border-purple-500/20 px-4 py-2 rounded-xl flex items-center gap-3">
      <Timer className="w-4 h-4 text-purple-500" />
      <div className="flex flex-col">
        <span className="text-[9px] font-black text-purple-500/50 uppercase tracking-widest">Token Validity</span>
        <span className="text-xs font-black text-white tracking-tighter">{timeLeft}</span>
      </div>
    </div>
  );
}

function AdminPanel({ onBack, currentUser, isAdminMode }: { onBack: () => void, currentUser: FirebaseUser | null, isAdminMode: boolean }) {
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [newToken, setNewToken] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDays, setEditDays] = useState(30);
  const [editLabel, setEditLabel] = useState("");

  const isAdmin = isAdminMode || currentUser?.email === "waleedawang1020@gmail.com";

  const handleAdminLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Admin login failed", error);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;

    const q = query(collection(db, 'tokens'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tokensData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];
      
      setTokens(tokensData.map(t => ({
        id: t.id,
        label: t.label,
        createdAt: t.createdAt,
        expiresAt: t.expiresAt,
        status: t.status
      })));
    }, (error) => {
      console.error("Firebase subscription error:", error);
    });

    return () => unsubscribe();
  }, [isAdmin]);

  const handleAddToken = async () => {
    if (!newToken.trim()) return;
    const cleanToken = newToken.trim().toLowerCase();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    try {
      await setDoc(doc(db, 'tokens', cleanToken), {
        id: cleanToken,
        label: newLabel || "User",
        createdAt: Timestamp.fromDate(new Date()),
        expiresAt: Timestamp.fromDate(expiresAt),
        status: 'active'
      });

      setNewToken("");
      setNewLabel("");
      alert("Token added successfully!");
    } catch (err: any) {
      console.error("Failed to add token to Firebase", err);
      alert(`Failed to add token: ${err.message || "Unknown error"}`);
    }
  };

  const handleDeleteToken = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'tokens', id));
      alert("Token deleted successfully!");
    } catch (err: any) {
      console.error("Failed to delete token from Firebase", err);
      alert(`Failed to delete token: ${err.message || "Unknown error"}`);
    }
  };

  const handleUpdateToken = async (id: string) => {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + editDays);
    try {
      await updateDoc(doc(db, 'tokens', id), {
        expiresAt: Timestamp.fromDate(expiresAt),
        label: editLabel || "User",
        status: 'active'
      });
      
      setEditingId(null);
      alert("Token updated successfully!");
    } catch (err: any) {
      console.error("Failed to update token in Firebase", err);
      alert(`Failed to update token: ${err.message || "Unknown error"}`);
    }
  };

  return (
    <div className="w-full max-w-2xl bg-[#1a1625] border border-neutral-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-600/10 blur-[100px] rounded-full" />
      
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-600/20">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none">Admin Panel</h2>
            <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest mt-1">Manage Access Tokens</p>
          </div>
        </div>
        <div className="flex gap-3">
          {isAdminMode ? (
            <div className="flex items-center gap-3 bg-neutral-900/50 px-4 py-2 rounded-xl border border-neutral-800">
              <ShieldAlert className="w-4 h-4 text-purple-500" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Admin Token Access</span>
            </div>
          ) : currentUser ? (
            <div className="flex items-center gap-3 bg-neutral-900/50 px-4 py-2 rounded-xl border border-neutral-800">
              <img src={currentUser?.photoURL || ""} alt="Admin" className="w-6 h-6 rounded-full" referrerPolicy="no-referrer" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">{currentUser?.displayName}</span>
            </div>
          ) : (
            <button 
              onClick={handleAdminLogin}
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-widest transition-all flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              Login as Admin
            </button>
          )}
          <button 
            onClick={onBack}
            className="bg-neutral-900 hover:bg-neutral-800 text-white font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-widest transition-all"
          >
            Back to Bot
          </button>
        </div>
      </div>

      {!isAdmin ? (
        <div className="relative z-10 py-20 text-center">
          <div className="w-20 h-20 bg-purple-600/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-10 h-10 text-purple-500" />
          </div>
          <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-2">Restricted Access</h3>
          <p className="text-neutral-500 text-sm font-medium mb-8 max-w-xs mx-auto">
            You must be logged in as the authorized admin or enter with the admin token to manage tokens.
          </p>
          <button 
            onClick={handleAdminLogin}
            className="bg-purple-600 hover:bg-purple-500 text-white font-black px-10 py-4 rounded-2xl transition-all shadow-lg shadow-purple-600/20 uppercase tracking-widest text-xs"
          >
            Authenticate Now
          </button>
        </div>
      ) : (
        <div className="space-y-6 relative z-10">
        <div className="bg-neutral-950/50 border border-neutral-800 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Quick Add Token</h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">30 Days Auto-Set</span>
              <div className="w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center">
                <Plus className="w-4 h-4 text-purple-500" />
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input 
                type="text"
                value={newToken}
                onChange={(e) => setNewToken(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddToken()}
                placeholder="Enter new token string..."
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-11 pr-4 py-4 text-sm font-bold text-white focus:outline-none focus:border-purple-500 transition-all"
              />
            </div>
            <button 
              onClick={handleAddToken}
              className="bg-purple-600 hover:bg-purple-500 text-white font-black px-8 rounded-xl transition-all shadow-lg shadow-purple-600/20 uppercase tracking-widest text-xs flex items-center gap-2"
            >
              Add
            </button>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <input 
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Optional User Label (e.g. Waleed)"
              className="flex-1 bg-transparent border-none text-[10px] font-bold text-neutral-500 focus:outline-none focus:text-neutral-300 transition-all"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-black text-white uppercase tracking-widest ml-1">Active Tokens ({tokens.length})</h3>
          <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {tokens.map(token => (
              <div key={token.id} className="bg-neutral-900/50 border border-neutral-800 p-5 rounded-2xl flex items-center justify-between group hover:border-purple-500/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-neutral-800 rounded-xl flex items-center justify-center">
                    <Key className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-black text-white">{token.id}</p>
                      <span className="text-[9px] bg-purple-600/20 text-purple-400 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">{token.label}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="w-3 h-3 text-neutral-600" />
                      <p className="text-[10px] font-bold text-neutral-500">
                        Expires: {token.expiresAt instanceof Timestamp ? token.expiresAt.toDate().toLocaleDateString() : new Date(token.expiresAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {editingId === token.id ? (
                    <div className="flex flex-col gap-2 bg-neutral-950 p-3 rounded-xl border border-purple-500/30">
                      <div className="flex items-center gap-2">
                        <input 
                          type="text"
                          value={editLabel}
                          onChange={(e) => setEditLabel(e.target.value)}
                          placeholder="Label"
                          className="w-24 bg-neutral-900 border border-neutral-800 rounded-lg px-2 py-1 text-[10px] font-bold text-white"
                        />
                        <div className="flex items-center gap-1">
                          <input 
                            type="number"
                            value={editDays}
                            onChange={(e) => setEditDays(parseInt(e.target.value))}
                            className="w-12 bg-neutral-900 border border-neutral-800 rounded-lg px-2 py-1 text-[10px] font-bold text-white"
                          />
                          <span className="text-[8px] font-black text-neutral-500 uppercase">Days</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleUpdateToken(token.id)} className="flex-1 py-1.5 bg-green-600 rounded-lg text-white hover:bg-green-500 transition-all flex items-center justify-center"><Save className="w-3 h-3" /></button>
                        <button onClick={() => setEditingId(null)} className="flex-1 py-1.5 bg-neutral-800 rounded-lg text-white hover:bg-neutral-700 transition-all flex items-center justify-center"><X className="w-3 h-3" /></button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button onClick={() => { setEditingId(token.id); setEditDays(30); setEditLabel(token.label || ""); }} className="p-2 bg-neutral-800 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-700 transition-all"><Edit2 className="w-3 h-3" /></button>
                      <button onClick={() => handleDeleteToken(token.id)} className="p-2 bg-red-600/10 rounded-lg text-red-500 hover:bg-red-600 hover:text-white transition-all"><Trash2 className="w-3 h-3" /></button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      )}
    </div>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [userTokenData, setUserTokenData] = useState<TokenData | null>(null);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  
  const [inputToken, setInputToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showExpiredModal, setShowExpiredModal] = useState(false);
  const [selectedBroker, setSelectedBroker] = useState("");
  const [selectedPair, setSelectedPair] = useState("");
  const [selectedTimeframe, setSelectedTimeframe] = useState("");
  const [pairSearch, setPairSearch] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [signal, setSignal] = useState<string | null>(null);
  const [detailedSignal, setDetailedSignal] = useState<DetailedSignal | null>(null);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [activeQuotexSignals, setActiveQuotexSignals] = useState<Record<string, number>>({});
  const [quotexWaitTime, setQuotexWaitTime] = useState<string | null>(null);
  const [binanceSymbols, setBinanceSymbols] = useState<string[]>([]);
  const [isLoadingSymbols, setIsLoadingSymbols] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('mw_sound_enabled');
    return saved !== null ? saved === 'true' : true;
  });

  useEffect(() => {
    localStorage.setItem('mw_sound_enabled', soundEnabled.toString());
  }, [soundEnabled]);

  const playAlertSound = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.5); // A4

      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (err) {
      console.error("Failed to play alert sound", err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    };
    testConnection();
  }, []);

  useEffect(() => {
    const checkSavedToken = async () => {
      const savedToken = localStorage.getItem('mw_trader_token');
      if (savedToken) {
        if (savedToken === "adminwaleed786") {
          setIsAdminMode(true);
          setIsLoggedIn(true);
          return;
        }

        try {
          const docRef = doc(db, 'tokens', savedToken);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            const expiry = new Date(data.expiresAt);
            if (expiry.getTime() > Date.now()) {
              setUserTokenData({
                id: data.id,
                label: data.label,
                createdAt: data.createdAt,
                expiresAt: data.expiresAt,
                status: data.status
              });
              setIsLoggedIn(true);
            } else {
              localStorage.removeItem('mw_trader_token');
            }
          } else {
            localStorage.removeItem('mw_trader_token');
          }
        } catch (err) {
          console.error("Token check failed", err);
        }
      }
    };
    checkSavedToken();
  }, []);

  useEffect(() => {
    if (selectedBroker === "Binance") {
      setIsLoadingSymbols(true);
      // Fetch directly from Binance API to be serverless/Netlify compatible
      fetch('https://api.binance.com/api/v3/exchangeInfo')
        .then(res => res.json())
        .then(data => {
          const symbols = data.symbols
            .filter((s: any) => s.status === 'TRADING' && s.quoteAsset === 'USDT')
            .map((s: any) => s.symbol)
            .sort();
          setBinanceSymbols(symbols);
          setIsLoadingSymbols(false);
        })
        .catch(err => {
          console.error("Failed to fetch symbols from Binance API", err);
          // Fallback to some common pairs if API fails
          setBinanceSymbols(["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT", "XRPUSDT"]);
          setIsLoadingSymbols(false);
        });
    } else {
      setBinanceSymbols([]);
    }
    setSelectedPair(""); // Reset pair when broker changes
    setSignal(null);
    setDetailedSignal(null);
  }, [selectedBroker]);

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-[#0f0a1a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
          <p className="text-xs font-black text-white uppercase tracking-widest animate-pulse">Initializing Systems...</p>
        </div>
      </div>
    );
  }

  const handleLogin = async () => {
    const cleanToken = inputToken.trim().toLowerCase();
    setError(null);
    
    if (cleanToken === "adminwaleed786") {
      localStorage.setItem('mw_trader_token', cleanToken);
      setIsAdminMode(true);
      setIsLoggedIn(true);
      return;
    }

    try {
      const docRef = doc(db, 'tokens', cleanToken);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        const expiry = new Date(data.expiresAt);
        
        if (expiry.getTime() > Date.now()) {
          localStorage.setItem('mw_trader_token', cleanToken);
          setUserTokenData({
            id: data.id,
            label: data.label,
            createdAt: data.createdAt,
            expiresAt: data.expiresAt,
            status: data.status
          });
          setIsLoggedIn(true);
          setError(null);
        } else {
          setShowExpiredModal(true);
          setError("This token has expired. Please contact admin for renewal.");
        }
      } else {
        setShowTokenModal(true);
        setError("Access denied. Please contact support for a valid token.");
      }
    } catch (err: any) {
      console.error("Login failed", err);
      setError(`System error: ${err.message || "Please try again later."}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('mw_trader_token');
    setIsLoggedIn(false);
    setIsAdminMode(false);
    setUserTokenData(null);
    setInputToken("");
    setSignal(null);
    setDetailedSignal(null);
    setError(null);
    setSelectedBroker("");
    setSelectedPair("");
    setPairSearch("");
    setSelectedTimeframe("");
  };

  const parseTimeframe = (tf: string): number => {
    const value = parseInt(tf);
    if (tf.endsWith('s')) return value * 1000;
    if (tf.endsWith('m')) return value * 60 * 1000;
    return 0;
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const generateSignal = async () => {
    console.log("Generate Signal clicked", { selectedBroker, selectedPair, selectedTimeframe });
    if (!selectedBroker || !selectedPair || (selectedBroker === "Quotex" && !selectedTimeframe)) {
      alert("Please select broker, pair, and timeframe first!");
      return;
    }

    // Quotex specific wait logic
    if (selectedBroker === "Quotex") {
      const signalKey = `${selectedPair}_${selectedTimeframe}`;
      const expiration = activeQuotexSignals[signalKey];
      const now = Date.now();

      if (expiration && now < expiration) {
        const remainingSeconds = Math.ceil((expiration - now) / 1000);
        setQuotexWaitTime(`Please wait ${formatTime(remainingSeconds)} for the next signal on this pair.`);
        setTimeout(() => setQuotexWaitTime(null), 3000);
        return;
      }
    }
    
    setIsGenerating(true);
    setSignal(null);
    setDetailedSignal(null);
    setQuotexWaitTime(null);
    setError(null);

    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("Gemini API Key is missing. Please set GEMINI_API_KEY in environment variables.");
      }
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      let context = "";
      let currentPrice = 0;

      if (selectedBroker === "Binance") {
        // Fetch current price and 24h stats from Binance
        const [priceRes, tickerRes] = await Promise.all([
          fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${selectedPair}`),
          fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${selectedPair}`)
        ]);
        const priceData = await priceRes.json();
        const tickerData = await tickerRes.json();
        currentPrice = parseFloat(priceData.price);
        context = `Current Price: ${currentPrice}. 24h Change: ${tickerData.priceChangePercent}%. 24h High: ${tickerData.highPrice}. 24h Low: ${tickerData.lowPrice}. Volume: ${tickerData.volume}.`;
      }

      const isBinary = selectedBroker === "Quotex";
      console.log(`Generating signal for ${selectedBroker} - ${selectedPair}`);
      
      const prompt = isBinary 
        ? `Analyze the live market for ${selectedPair} for a ${selectedTimeframe} binary options trade. 
           Use Google Search to find the latest live price, RSI, and MACD indicators for this pair right now.
           Provide a high-probability signal in JSON format:
           "trend" (Strong Buy/Strong Sell/Neutral),
           "entry" (suggested entry price),
           "tp" (not applicable for binary, use "N/A"),
           "sl" (not applicable for binary, use "N/A"),
           "ratio" (Win Probability, e.g. "85%"),
           "analysis" (2-3 sentences of professional technical reasoning based on live data).`
        : `You are a professional ${selectedBroker === 'Binance' ? 'crypto' : 'forex'} analyst. 
           Analyze ${selectedPair} ${selectedBroker === 'Binance' ? '' : '(Forex)'}. 
           ${context ? `Live Data: ${context}` : `Use Google Search to find the latest live price and market sentiment for this pair right now.`}
           Provide a high-probability trading signal in JSON format with these EXACT fields:
           "trend" (Bullish/Bearish/Neutral), 
           "entry" (suggested entry price), 
           "tp" (Take Profit target), 
           "sl" (Stop Loss level), 
           "ratio" (Risk/Reward ratio, e.g. "1:2.5"),
           "conditions" (Specific market conditions to watch for, e.g. "Wait for H1 candle close above 2030"),
           "analysis" (2-3 sentences of technical reasoning. Use bold markdown for key terms).`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { 
          responseMimeType: "application/json",
          tools: [{ googleSearch: {} }]
        }
      });

      console.log("AI Response:", response.text);
      const result = JSON.parse(response.text || "{}");
      
      playAlertSound();

      if (isBinary) {
        // For binary options, we show a simpler but powerful signal
        const trend = result.trend || "Neutral";
        const prefix = trend.includes("Strong") ? "🔥 " : "";
        const arrow = trend.includes("Buy") || trend.includes("Bullish") ? "⬆️" : "⬇️";
        const signalText = `${prefix}${trend.toUpperCase()} (${trend.includes("Buy") ? 'CALL' : 'PUT'}) ${arrow}`;
        setSignal(signalText);
        
        // Set expiration for Quotex
        const duration = parseTimeframe(selectedTimeframe);
        const signalKey = `${selectedPair}_${selectedTimeframe}`;
        setActiveQuotexSignals(prev => ({
          ...prev,
          [signalKey]: Date.now() + duration
        }));
      } else {
        setDetailedSignal({ 
          ...result, 
          price: currentPrice || parseFloat(result.entry) || 0,
          conditions: result.conditions || "No specific conditions."
        });
      }
      
      setIsGenerating(false);
    } catch (err) {
      console.error("Signal generation failed", err);
      setError("Failed to generate signal. Please check your internet or try again.");
      setIsGenerating(false);
    }
  };

  const currentPairs = (selectedBroker === "Binance" ? binanceSymbols : DEFAULT_PAIRS)
    .filter(p => p.toLowerCase().includes(pairSearch.toLowerCase()));

  if (!isLoggedIn) {
    return (
      <div className="w-full max-w-md px-4 py-10">
        <div className="bg-[#1a1625] border border-neutral-800/50 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
          {/* Background subtle glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-600/10 blur-[100px] rounded-full" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-600/10 blur-[100px] rounded-full" />

          <WarningBox />
          
          <MWLogo />

          <AnimatePresence>
            {showTokenModal && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
              >
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  className="bg-[#1a1625] border border-purple-500/30 p-8 rounded-[2.5rem] max-w-sm w-full shadow-2xl text-center relative overflow-hidden"
                >
                  <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-600/10 blur-[100px] rounded-full" />
                  
                  <div className="relative z-10 space-y-6">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
                      <ShieldAlert className="w-8 h-8 text-red-500" />
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Access Denied</h3>
                      <p className="text-neutral-400 text-sm font-bold leading-relaxed">
                        The provided access token is invalid or expired. To obtain a valid license, please contact our official support team.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <button 
                        onClick={() => window.open('https://wa.me/923165581294', '_blank')}
                        className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-green-500/20 flex items-center justify-center gap-3 uppercase tracking-wider"
                      >
                        <MessageSquare className="w-5 h-5" />
                        Contact Admin
                      </button>
                      
                      <button 
                        onClick={() => setShowTokenModal(false)}
                        className="w-full bg-neutral-900 hover:bg-neutral-800 text-neutral-400 font-bold py-3 rounded-xl transition-all text-xs uppercase tracking-widest"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {showExpiredModal && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
              >
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  className="bg-[#1a1625] border border-red-500/30 p-8 rounded-[2.5rem] max-w-sm w-full shadow-2xl text-center relative overflow-hidden"
                >
                  <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-600/10 blur-[100px] rounded-full" />
                  
                  <div className="relative z-10 space-y-6">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
                      <Clock className="w-8 h-8 text-red-500" />
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Token Expired</h3>
                      <p className="text-neutral-400 text-sm font-bold leading-relaxed">
                        Aapka token expired ho gya hay. Dubara active karne ke liye admin se contact karein.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <button 
                        onClick={() => window.open('https://wa.me/923165581294', '_blank')}
                        className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-green-500/20 flex items-center justify-center gap-3 uppercase tracking-wider"
                      >
                        <MessageSquare className="w-5 h-5" />
                        Contact Admin
                      </button>
                      
                      <button 
                        onClick={() => setShowExpiredModal(false)}
                        className="w-full bg-neutral-900 hover:bg-neutral-800 text-neutral-400 font-bold py-3 rounded-xl transition-all text-xs uppercase tracking-widest"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-6 relative z-10">
            <div className="space-y-3">
              <label className="text-sm font-bold text-white ml-1">Enter Access Token:</label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Enter Access Token..." 
                  value={inputToken}
                  onChange={(e) => setInputToken(e.target.value)}
                  className="w-full bg-[#eef2ff] border border-neutral-700 rounded-xl px-5 py-4 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-bold placeholder:text-neutral-400"
                />
              </div>
            </div>

            <button 
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-[#6366f1] to-[#a855f7] hover:opacity-90 transition-all text-white font-black py-5 rounded-2xl shadow-lg shadow-indigo-500/20 uppercase tracking-wider"
            >
              Access Bot
            </button>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => window.open('https://chat.whatsapp.com/IiAmbx0BwMeENwMwk77ih9?mode=gi_t', '_blank')}
                className="bg-gradient-to-r from-[#6366f1]/80 to-[#a855f7]/80 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-md"
              >
                <MessageSquare className="w-5 h-5" />
                Free Group
              </button>
              <button 
                onClick={() => window.open('https://wa.me/923165581294', '_blank')}
                className="bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-md"
              >
                <Activity className="w-5 h-5" />
                Contact Admin
              </button>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-[#450a0a]/80 border border-red-500/30 p-5 rounded-2xl text-center mt-6"
                >
                  <p className="text-red-400 text-sm font-bold leading-relaxed">
                    {error}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  }

  if (isAdminMode) {
    return (
      <div className="min-h-screen bg-[#0f0a1a] flex items-center justify-center p-4">
        <AdminPanel onBack={() => setIsAdminMode(false)} currentUser={currentUser} isAdminMode={isAdminMode} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-md px-4 py-10">
      <div className="bg-[#1a1625] border border-neutral-800/50 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between absolute top-6 left-6 right-6 z-20">
          <div className="flex items-center gap-2">
            {userTokenData && <TokenTimer expiresAt={userTokenData.expiresAt} />}
            <button 
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2.5 rounded-xl transition-all flex items-center justify-center shadow-lg ${soundEnabled ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' : 'bg-neutral-800 text-neutral-500 border border-neutral-700/50'}`}
              title={soundEnabled ? "Disable Sound" : "Enable Sound"}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
          <div className="flex gap-2">
            {(localStorage.getItem('mw_trader_token') === 'adminwaleed786' || currentUser?.email === "waleedawang1020@gmail.com") && (
              <button 
                onClick={() => setIsAdminMode(true)}
                className="bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all border border-neutral-700/50 shadow-lg"
              >
                <ShieldAlert className="w-4 h-4 text-purple-500" />
                Admin
              </button>
            )}
            <button 
              onClick={handleLogout}
              className="bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 hover:opacity-90 transition-all shadow-lg"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        <div className="mt-12">
          <WarningBox />
        </div>

        <MWLogo />

        <div className="space-y-6 relative z-10">
          <div className="space-y-2">
            <label className="text-xs font-black text-neutral-500 uppercase tracking-widest ml-1">Select Broker:</label>
            <div className="relative">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
              <select 
                value={selectedBroker}
                onChange={(e) => setSelectedBroker(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-12 pr-4 py-4 text-sm font-bold focus:outline-none focus:border-purple-500 appearance-none text-white transition-all"
              >
                <option value="">Choose a broker...</option>
                {BROKERS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-neutral-500 uppercase tracking-widest ml-1">Select Pair:</label>
            <div className="space-y-3">
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <BarChart3 className="w-4 h-4 text-neutral-500 group-focus-within:text-purple-500 transition-colors" />
                </div>
                <input 
                  type="text"
                  placeholder="Search pair (e.g. BTC, EUR)..."
                  value={pairSearch}
                  onChange={(e) => setPairSearch(e.target.value)}
                  className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl pl-11 pr-4 py-3 text-xs font-bold focus:outline-none focus:border-purple-500/50 text-white transition-all placeholder:text-neutral-700"
                />
              </div>
              <div className="relative">
                <BarChart3 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                <select 
                  value={selectedPair}
                  onChange={(e) => setSelectedPair(e.target.value)}
                  disabled={isLoadingSymbols}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-12 pr-4 py-4 text-sm font-bold focus:outline-none focus:border-purple-500 appearance-none text-white transition-all disabled:opacity-50"
                >
                  <option value="">{isLoadingSymbols ? "Loading symbols..." : "Choose a pair..."}</option>
                  {currentPairs.length > 0 ? (
                    currentPairs.map(p => <option key={p} value={p}>{p}</option>)
                  ) : (
                    <option disabled>No pairs found</option>
                  )}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 pointer-events-none" />
              </div>
            </div>
          </div>

          {selectedBroker === "Quotex" && (
            <div className="space-y-2">
              <label className="text-xs font-black text-neutral-500 uppercase tracking-widest ml-1">Select Timeframe:</label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                <select 
                  value={selectedTimeframe}
                  onChange={(e) => setSelectedTimeframe(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-12 pr-4 py-4 text-sm font-bold focus:outline-none focus:border-purple-500 appearance-none text-white transition-all"
                >
                  <option value="">Choose a timeframe...</option>
                  {TIMEFRAMES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 pointer-events-none" />
              </div>
            </div>
          )}

          <button 
            onClick={generateSignal}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-[#6366f1] to-[#a855f7] hover:opacity-90 transition-all text-white font-black py-5 rounded-2xl shadow-lg shadow-indigo-500/20 uppercase tracking-wider disabled:opacity-50"
          >
            {isGenerating ? "Analyzing Market..." : "Generate Signal"}
          </button>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => window.open('https://chat.whatsapp.com/IiAmbx0BwMeENwMwk77ih9?mode=gi_t', '_blank')}
              className="bg-neutral-900/50 border border-neutral-800 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-neutral-800 transition-all shadow-md"
            >
              <MessageSquare className="w-4 h-4 text-purple-500" />
              <span className="text-xs uppercase tracking-widest">Free Group</span>
            </button>
            <button 
              onClick={() => window.open('https://wa.me/923165581294', '_blank')}
              className="bg-neutral-900/50 border border-neutral-800 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-neutral-800 transition-all shadow-md"
            >
              <Activity className="w-4 h-4 text-green-500" />
              <span className="text-xs uppercase tracking-widest">Contact Admin</span>
            </button>
          </div>

          <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-6 text-center min-h-[140px] flex flex-col items-center justify-center shadow-inner relative overflow-hidden">
            {isGenerating && (
              <div className="absolute inset-0 bg-neutral-950/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
                <p className="text-xs font-black text-white uppercase tracking-widest animate-pulse">Analyzing Market Data...</p>
              </div>
            )}

            {quotexWaitTime ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-2xl"
              >
                <AlertTriangle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-sm font-black text-yellow-500 uppercase tracking-widest">Wait for Timer</p>
                <p className="text-[11px] text-neutral-400 mt-1 font-bold">{quotexWaitTime}</p>
              </motion.div>
            ) : detailedSignal ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full space-y-6 text-left"
              >
                <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${detailedSignal.trend === 'Bullish' ? 'bg-green-500/10 text-green-500' : detailedSignal.trend === 'Bearish' ? 'bg-red-500/10 text-red-500' : 'bg-neutral-500/10 text-neutral-500'}`}>
                      {detailedSignal.trend === 'Bullish' ? <TrendingUp className="w-5 h-5" /> : detailedSignal.trend === 'Bearish' ? <TrendingDown className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Market Trend</p>
                      <p className={`text-sm font-black ${detailedSignal.trend === 'Bullish' ? 'text-green-500' : detailedSignal.trend === 'Bearish' ? 'text-red-500' : 'text-neutral-500'}`}>{detailedSignal.trend}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Live Price</p>
                    <p className="text-sm font-black text-white">{selectedBroker === 'Binance' ? '$' : ''}{detailedSignal.price.toLocaleString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-neutral-900/50 p-4 rounded-2xl border border-neutral-800/50">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="w-3 h-3 text-purple-500" />
                      <p className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Entry Price</p>
                    </div>
                    <p className="text-sm font-black text-white">{selectedBroker === 'Binance' ? '$' : ''}{detailedSignal.entry}</p>
                  </div>
                  <div className="bg-neutral-900/50 p-4 rounded-2xl border border-neutral-800/50">
                    <div className="flex items-center gap-2 mb-1">
                      <Activity className="w-3 h-3 text-blue-500" />
                      <p className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">R:R Ratio</p>
                    </div>
                    <p className="text-sm font-black text-white">{detailedSignal.ratio}</p>
                  </div>
                  <div className="bg-green-500/5 p-4 rounded-2xl border border-green-500/10">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-3 h-3 text-green-500" />
                      <p className="text-[9px] font-black text-green-500/50 uppercase tracking-widest">Take Profit</p>
                    </div>
                    <p className="text-sm font-black text-green-500">{selectedBroker === 'Binance' ? '$' : ''}{detailedSignal.tp}</p>
                  </div>
                  <div className="bg-red-500/5 p-4 rounded-2xl border border-red-500/10">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertCircle className="w-3 h-3 text-red-500" />
                      <p className="text-[9px] font-black text-red-500/50 uppercase tracking-widest">Stop Loss</p>
                    </div>
                    <p className="text-sm font-black text-red-500">{selectedBroker === 'Binance' ? '$' : ''}{detailedSignal.sl}</p>
                  </div>
                </div>

                <div className="bg-blue-500/5 p-4 rounded-2xl border border-blue-500/10">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldAlert className="w-3 h-3 text-blue-500" />
                    <p className="text-[9px] font-black text-blue-500/50 uppercase tracking-widest">Trade Conditions</p>
                  </div>
                  <p className="text-[11px] text-neutral-300 leading-relaxed font-bold">
                    {detailedSignal.conditions}
                  </p>
                </div>

                <div className="bg-purple-500/5 p-4 rounded-2xl border border-purple-500/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-3 h-3 text-purple-500" />
                    <p className="text-[9px] font-black text-purple-500/50 uppercase tracking-widest">Expert Advice</p>
                  </div>
                  <p className="text-[11px] text-neutral-300 leading-relaxed font-medium italic">
                    {detailedSignal.analysis}
                  </p>
                </div>
              </motion.div>
            ) : signal ? (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="space-y-3"
              >
                <p className="text-[11px] font-black text-neutral-600 uppercase tracking-[0.3em]">Recommended Action</p>
                <p className={`text-3xl font-black italic tracking-tighter ${signal.includes('CALL') ? 'text-green-500' : 'text-red-500'}`}>
                  {signal}
                </p>
              </motion.div>
            ) : (
              <div className="space-y-2">
                <p className="text-neutral-600 text-sm font-bold italic">
                  Select broker and pair
                </p>
                <p className="text-neutral-700 text-[10px] font-black uppercase tracking-widest">
                  to generate signals
                </p>
              </div>
            )}

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl"
              >
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">System Error</p>
                </div>
                <p className="text-[11px] text-red-400 font-bold leading-relaxed">{error}</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
