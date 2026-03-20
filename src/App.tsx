import { useEffect, useMemo, useRef, useState } from 'react';
import { Mic, ShoppingCart, X, Plus, Minus, Loader2, Search, MapPin, Banknote, CheckCircle, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type } from '@google/genai';
import { CATALOG } from './catalog';
import type { Product } from './catalog';

const geminiApiKey = process.env.GEMINI_API_KEY;
const ai = geminiApiKey ? new GoogleGenAI({ apiKey: geminiApiKey }) : null;
const catalogContext = CATALOG.map((p) => `{id: ${p.id}, name: "${p.name}", category: "${p.category}"}`).join('\n');

async function extractAndMatchItems(text: string) {
  if (!ai) {
    console.warn('GEMINI_API_KEY is not configured. Voice and text parsing are disabled.');
    return [];
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are an AI shopping assistant for an Indian grocery app.
      The user said: "${text}" (This could be in English or Hinglish).
      
      Here is our catalog:
      ${catalogContext}
      
      Match the user's requested items to the catalog. If they ask for a general category (like "doodh" or "milk"), pick the most relevant item (e.g., Amul Taaza Milk).
      Determine if the user wants to add the item or remove it.
      Return a JSON array of matched product IDs, the requested quantity, and the action ("add" or "remove"). If no quantity is specified for adding, assume 1. If no quantity is specified for removing, assume they want to remove all of that item (use a large number like 999).`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.NUMBER },
                  quantity: { type: Type.NUMBER },
                  action: { type: Type.STRING, description: "'add' or 'remove'" },
                },
                required: ['id', 'quantity', 'action'],
              },
            },
          },
          required: ['items'],
        },
      },
    });

    const data = JSON.parse(response.text || '{"items":[]}');
    return data.items;
  } catch (error) {
    console.error('Error parsing text:', error);
    return [];
  }
}

interface CartItem extends Product {
  cartQuantity: number;
}

export default function App() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [processingCount, setProcessingCount] = useState(0);
  const isProcessing = processingCount > 0;
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartView, setCartView] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [address, setAddress] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recognitionRef = useRef<any>(null);
  const fullTranscriptRef = useRef('');
  const interimTranscriptRef = useRef('');

  const displayedProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return CATALOG;
    }

    return CATALOG.filter(
      (product) => product.name.toLowerCase().includes(query) || product.category.toLowerCase().includes(query),
    );
  }, [searchQuery]);

  useEffect(() => {
    return () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }

      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }

      window.speechSynthesis.cancel();
    };
  }, []);

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-IN';
    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const stopListening = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const startListening = () => {
    if (!ai) {
      alert('Please add a GEMINI_API_KEY before using voice commands.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'en-IN';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    const resetSilenceTimer = () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = setTimeout(() => {
        recognition.stop();
      }, 10000);
    };

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
      fullTranscriptRef.current = '';
      interimTranscriptRef.current = '';
      resetSilenceTimer();
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript) {
        fullTranscriptRef.current += `${finalTranscript} `;
        void handleTranscript(finalTranscript, true);
      }

      interimTranscriptRef.current = interimTranscript;
      setTranscript(fullTranscriptRef.current + interimTranscript);
      resetSilenceTimer();
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

      if (interimTranscriptRef.current.trim()) {
        fullTranscriptRef.current += interimTranscriptRef.current;
        void handleTranscript(interimTranscriptRef.current, false);
        interimTranscriptRef.current = '';
      } else {
        setIsCartOpen(true);
      }
    };

    recognition.start();
  };

  const handleTranscript = async (text: string, isRealTime = false) => {
    if (!text.trim()) return;
    setProcessingCount((prev) => prev + 1);

    try {
      const extracted = await extractAndMatchItems(text);

      if (extracted && extracted.length > 0) {
        const addedNames: string[] = [];
        const removedNames: string[] = [];

        extracted.forEach((item: any) => {
          const product = CATALOG.find((p) => p.id === item.id);
          if (!product) return;
          if (item.action === 'remove') {
            if (!removedNames.includes(product.name)) removedNames.push(product.name);
          } else if (!addedNames.includes(product.name)) {
            addedNames.push(product.name);
          }
        });

        setCart((prev) => {
          const updated = [...prev];
          extracted.forEach((item: any) => {
            const product = CATALOG.find((p) => p.id === item.id);
            if (!product) return;

            const action = item.action || 'add';
            const qty = item.quantity || 1;

            if (action === 'remove') {
              const existingIndex = updated.findIndex((i) => i.id === item.id);
              if (existingIndex >= 0) {
                updated[existingIndex] = {
                  ...updated[existingIndex],
                  cartQuantity: updated[existingIndex].cartQuantity - qty,
                };
                if (updated[existingIndex].cartQuantity <= 0) {
                  updated.splice(existingIndex, 1);
                }
              }
            } else {
              const existingIndex = updated.findIndex((i) => i.id === item.id);
              if (existingIndex >= 0) {
                updated[existingIndex] = {
                  ...updated[existingIndex],
                  cartQuantity: updated[existingIndex].cartQuantity + qty,
                };
              } else {
                updated.push({ ...product, cartQuantity: qty });
              }
            }
          });
          return updated;
        });

        if (!isRealTime) {
          let textToSpeak = '';
          if (addedNames.length > 0) textToSpeak += `Added ${addedNames.join(' and ')}. `;
          if (removedNames.length > 0) textToSpeak += `Removed ${removedNames.join(' and ')}.`;
          if (!textToSpeak) textToSpeak = "I couldn't find those items in your cart to remove.";

          speak(textToSpeak.trim());
          setIsCartOpen(true);
        }
      } else if (!isRealTime) {
        speak(ai ? "Sorry, I didn't catch any grocery items." : 'Please add a GEMINI_API_KEY to enable voice and natural language item matching.');
      }
    } finally {
      setProcessingCount((prev) => prev - 1);
    }
  };

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) => (i.id === product.id ? { ...i, cartQuantity: i.cartQuantity + 1 } : i));
      }
      return [...prev, { ...product, cartQuantity: 1 }];
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQ = item.cartQuantity + delta;
            return newQ > 0 ? { ...item, cartQuantity: newQ } : item;
          }
          return item;
        })
        .filter((item) => item.cartQuantity > 0),
    );
  };

  const detectLocation = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      setAddress('Geolocation is not supported by your browser');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          setAddress(data.display_name || `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`);
        } catch {
          setAddress(`Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`);
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error(error);
        setAddress('Unable to retrieve your location. Please check permissions.');
        setIsLocating(false);
      },
    );
  };

  const placeOrder = () => {
    if (!address) {
      alert('Please detect your delivery address first.');
      return;
    }
    setCartView('success');
    speak('Order placed successfully. Your delivery is on the way.');
    setTimeout(() => setCart([]), 1000);
  };

  const closeSidebar = () => {
    setIsCartOpen(false);
    setTimeout(() => setCartView('cart'), 300);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.cartQuantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.cartQuantity, 0);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-24">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              Z
            </div>
            <h1 className="text-xl font-bold tracking-tight">Zepto Lite</h1>
          </div>
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Open cart"
          >
            <ShoppingCart className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-purple-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center transform translate-x-1 -translate-y-1">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">What do you need?</h2>
          <p className="text-gray-500 text-sm mb-6">Tap the mic and speak. It listens until a 10s pause.</p>

          <div className="flex flex-col items-center justify-center">
            <button
              onClick={toggleListening}
              disabled={isProcessing}
              className={`relative w-20 h-20 rounded-full flex items-center justify-center text-white shadow-lg transition-all ${
                isListening ? 'bg-red-500 scale-110' : isProcessing ? 'bg-purple-400' : 'bg-purple-600 hover:bg-purple-700'
              }`}
              aria-label={isListening ? 'Stop listening' : 'Start listening'}
            >
              {isListening && <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75"></span>}
              {isProcessing ? <Loader2 className="w-8 h-8 animate-spin" /> : <Mic className="w-8 h-8 z-10" />}
            </button>

            <div className="mt-4 h-6 text-sm font-medium text-purple-600">
              {isListening ? 'Listening...' : isProcessing ? 'Finding items...' : ''}
            </div>
          </div>

          <div className="mt-6 relative">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  void handleTranscript(searchQuery, false);
                  setSearchQuery('');
                }
              }}
            >
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Or type '2 kilo atta chahiye' and press Enter..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={isProcessing}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all text-sm"
              />
            </form>
            {transcript && <p className="mt-3 text-sm text-gray-500">Heard: {transcript}</p>}
          </div>

          {!geminiApiKey && (
            <p className="mt-4 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
              Add a <code>GEMINI_API_KEY</code> in your local env file to enable voice and natural-language item matching.
            </p>
          )}
        </div>

        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">Popular Items</h3>
          <span className="text-sm text-gray-500">{displayedProducts.length} products</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {displayedProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex flex-col">
              <div className="relative aspect-square bg-gray-50 rounded-xl flex items-center justify-center text-5xl mb-3">
                {product.emoji}
                <div
                  className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-1 rounded-md ${
                    product.platform === 'Zepto' ? 'bg-[#8B5CF6] text-white' : 'bg-[#FFCD00] text-black'
                  }`}
                >
                  {product.platform}
                </div>
                <div className="absolute bottom-2 right-2 text-[10px] font-medium bg-white/80 backdrop-blur-sm px-1.5 py-0.5 rounded text-gray-600">
                  {product.time}
                </div>
              </div>

              <div className="flex-1">
                <h4 className="font-medium text-sm leading-tight mb-1 line-clamp-2">{product.name}</h4>
                <p className="text-xs text-gray-500 mb-2">{product.unit}</p>
              </div>

              <div className="flex items-center justify-between mt-auto pt-2">
                <span className="font-bold text-sm">₹{product.price}</span>
                <button
                  onClick={() => addToCart(product)}
                  className="bg-purple-50 text-purple-700 hover:bg-purple-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                >
                  ADD
                </button>
              </div>
            </div>
          ))}
        </div>

        {displayedProducts.length === 0 && <div className="text-center py-12 text-gray-500">No products found matching "{searchQuery}"</div>}
      </main>

      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeSidebar}
              className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl z-50 flex flex-col"
            >
              {cartView === 'cart' && (
                <>
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5" />
                      Your Cart ({cartCount})
                    </h2>
                    <button onClick={closeSidebar} className="p-2 hover:bg-gray-100 rounded-full transition-colors" aria-label="Close cart">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4">
                    {cart.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
                        <ShoppingCart className="w-16 h-16 text-gray-200" />
                        <p>Your cart is empty</p>
                        <button onClick={closeSidebar} className="text-purple-600 font-medium hover:underline">
                          Start shopping
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {cart.map((item) => (
                          <div key={item.id} className="flex items-center gap-4 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                            <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center text-3xl">{item.emoji}</div>
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{item.name}</h4>
                              <p className="text-xs text-gray-500">{item.unit}</p>
                              <p className="font-bold text-sm mt-1">₹{item.price}</p>
                            </div>
                            <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1 border border-gray-200">
                              <button
                                onClick={() => updateQuantity(item.id, -1)}
                                className="w-7 h-7 flex items-center justify-center bg-white rounded shadow-sm text-gray-600 hover:text-purple-600"
                                aria-label={`Decrease quantity of ${item.name}`}
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="font-medium text-sm w-4 text-center">{item.cartQuantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, 1)}
                                className="w-7 h-7 flex items-center justify-center bg-white rounded shadow-sm text-gray-600 hover:text-purple-600"
                                aria-label={`Increase quantity of ${item.name}`}
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {cart.length > 0 && (
                    <div className="p-4 border-t border-gray-100 bg-white">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-gray-600">Total to pay</span>
                        <span className="text-xl font-bold">₹{cartTotal}</span>
                      </div>
                      <button
                        onClick={() => setCartView('checkout')}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-200 transition-all flex items-center justify-center gap-2"
                      >
                        Proceed to Checkout
                      </button>
                    </div>
                  )}
                </>
              )}

              {cartView === 'checkout' && (
                <>
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setCartView('cart')} className="p-2 hover:bg-gray-100 rounded-full transition-colors -ml-2" aria-label="Back to cart">
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                      <h2 className="text-lg font-bold">Checkout</h2>
                    </div>
                    <button onClick={closeSidebar} className="p-2 hover:bg-gray-100 rounded-full transition-colors" aria-label="Close checkout">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                      <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-purple-600" />
                        Delivery Address
                      </h3>

                      {address ? (
                        <div className="bg-purple-50 p-3 rounded-xl border border-purple-100 text-sm text-purple-900 mb-3">{address}</div>
                      ) : (
                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-sm text-gray-500 mb-3">No address selected</div>
                      )}

                      <button
                        onClick={detectLocation}
                        disabled={isLocating}
                        className="w-full py-2.5 bg-purple-100 text-purple-700 font-medium rounded-xl flex items-center justify-center gap-2 hover:bg-purple-200 transition-colors"
                      >
                        {isLocating ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                        {isLocating ? 'Locating...' : address ? 'Update Location' : 'Detect Live Location'}
                      </button>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                      <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <Banknote className="w-5 h-5 text-green-600" />
                        Payment Method
                      </h3>
                      <div className="flex items-center gap-3 p-3 border-2 border-purple-600 bg-purple-50 rounded-xl cursor-pointer">
                        <div className="w-5 h-5 rounded-full border-4 border-purple-600 bg-white"></div>
                        <span className="font-medium text-purple-900">Cash on Delivery</span>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                      <h3 className="font-bold text-gray-900 mb-3">Order Summary</h3>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Items Total</span>
                        <span>₹{cartTotal}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Delivery Fee</span>
                        <span className="text-green-600 font-medium">FREE</span>
                      </div>
                      <div className="border-t border-gray-100 my-2 pt-2 flex justify-between font-bold">
                        <span>Grand Total</span>
                        <span>₹{cartTotal}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border-t border-gray-100 bg-white">
                    <button
                      onClick={placeOrder}
                      disabled={!address}
                      className={`w-full font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${
                        address ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-200' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Place Order • ₹{cartTotal}
                    </button>
                  </div>
                </>
              )}

              {cartView === 'success' && (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-white">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                    className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6"
                  >
                    <CheckCircle className="w-12 h-12" />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h2>
                  <p className="text-gray-500 mb-8">
                    Your groceries are being packed and will arrive at your location in <strong>10-15 minutes</strong>.
                  </p>
                  <button onClick={closeSidebar} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold py-4 rounded-xl transition-colors">
                    Done
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
