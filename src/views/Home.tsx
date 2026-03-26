import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { API_BASE } from '@/services/apiBase';


export function Home() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [messages, setMessages] = useState([{ role: "ai", content: "Ask me about medicine usage..." }]);
  const [question, setQuestion] = useState("");

  useEffect(() => {
    if (user && user.role === 'user') {
      navigate('/pharmacies', { replace: true });
    }
  }, [user, navigate]);
  const askAssistant = async () => {
    const q = question.trim();
    if (!q) return;
  
    const updatedMessages = [...messages, { role: "user", content: q }];
    setMessages(updatedMessages);
    setQuestion("");
  
    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });
      const data = await res.json();
      setMessages([...updatedMessages, { role: "ai", content: data.content }]);
    } catch (err) {
      setMessages([...updatedMessages, { role: "ai", content: "AI is unavailable." }]);
    }
  };
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-pharmacy-600 text-white overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=1920&h=1080&fit=crop&q=80"
            alt="Healthcare background"
            className="w-full h-full object-cover opacity-20"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600/90 via-primary-700/85 to-pharmacy-600/90" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Medifinder
            </h1>
            <p className="mt-4 text-xl md:text-2xl text-primary-100 leading-relaxed">
            helps residents of Kigali quickly discover nearby pharmacies, check medicine availability, and confirm insurance acceptance before visiting — all in one simple platform. Sign up or log in to start finding care smarter and faster.
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose MediFinder?</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your trusted partner for finding medicines and pharmacies in Kigali
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="card text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Quick Search</h3>
            <p className="text-gray-600">
              Find pharmacies with your medicine in stock. No more wasted trips across the city.
            </p>
          </div>
          
          <div className="card text-center">
            <div className="w-16 h-16 bg-pharmacy-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-pharmacy-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Insurance Accepted</h3>
            <p className="text-gray-600">
              See which pharmacies accept your insurance before you visit. RSSB, Mutuelle, and more.
            </p>
          </div>
          
          <div className="card text-center">
            <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Home Delivery</h3>
            <p className="text-gray-600">
              Get your medicines delivered to your door. Convenient and safe, especially during busy times.
            </p>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="relative bg-primary-50 py-16 overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Simple steps to find and order your medicines in Kigali
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'Search Medicine', desc: 'Enter the medicine name you need', icon: '🔍' },
              { step: '2', title: 'Find Pharmacies', desc: 'See which pharmacies have it in stock', icon: '🏥' },
              { step: '3', title: 'Check Insurance', desc: 'Verify insurance acceptance', icon: '🛡️' },
              { step: '4', title: 'Order & Delivery', desc: 'Place order and get it delivered', icon: '🚚' },
            ].map((item) => (
              <div key={item.step} className="text-center card hover:scale-105 transition-transform duration-200">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-pharmacy-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-3xl shadow-lg">
                  {item.icon}
                </div>
                <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-sm font-bold">
                  {item.step}
                </div>
                <h3 className="font-semibold text-lg mb-2 text-gray-900">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Kigali Context Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Serving Kigali, Rwanda
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                MediFinder is designed specifically for residents of Kigali who face challenges finding their prescribed medicines. We understand the frustration of traveling across the city only to find that a pharmacy doesn't have your medicine or doesn't accept your insurance.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-pharmacy-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-5 h-5 text-pharmacy-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Real-time Stock Information</h3>
                    <p className="text-gray-600 text-sm">Know before you go - see which pharmacies have your medicine in stock</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Insurance Verification</h3>
                    <p className="text-gray-600 text-sm">Filter by RSSB, Mutuelle, and other insurance providers</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-accent-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-5 h-5 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Home Delivery Available</h3>
                    <p className="text-gray-600 text-sm">Get your medicines delivered to your door for convenience and safety</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=600&fit=crop&q=80" 
                  alt="Healthcare in Kigali" 
                  className="w-full h-auto object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=600&fit=crop&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-900/50 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative bg-gradient-to-r from-pharmacy-500 via-pharmacy-600 to-primary-600 text-white py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img 
            src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=1920&h=600&fit=crop&q=80" 
            alt="Healthcare background" 
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-xl mb-8 text-white/90">
            Log in or create an account to search for medicines and see pharmacies in Kigali.
          </p>
        </div>
      </div>

      <div className="bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">AI Medicine Assistant</h2>
            <p className="text-sm text-gray-600 mb-4">General educational guidance only. Not a diagnosis.</p>
            <div className="flex gap-2">
              <input
                className="input-field"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g. What are ibuprofen side effects?"
              />
              <button className="btn-primary" onClick={askAssistant}>Ask</button>
            </div>
            <div className="mt-4 space-y-3 max-h-80 overflow-y-auto">
  {messages.map((msg, idx) => (
    <div key={idx} className={`p-3 rounded-lg max-w-[80%] ${msg.role === "user" ? "bg-primary-600 text-white ml-auto" : "bg-gray-200 text-gray-800"}`}>
      {msg.content}
    </div>
  ))}
</div>
          </div>
        </div>
      </div>
    </div>
  );
}

