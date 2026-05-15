import { useState, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Send, Bot, User, Loader2, Pill } from 'lucide-react'
import Layout from '../components/Layout'
import { advancedAPI } from '../services/api'

const SUGGESTED = [
  "What is ROR and how is it used in pharmacovigilance?",
  "What are the most dangerous side effects of warfarin?",
  "Explain the difference between serious and non-serious adverse events",
  "How does the FDA FAERS reporting system work?",
  "What risk score indicates a drug needs an alert?",
]

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex gap-3 animate-safemed-fadein ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center
                       flex-shrink-0 mt-1 shadow-soft
                       ${isUser ? 'bg-medical-500' : 'bg-medical-100 border border-medical-200'}`}>
        {isUser
          ? <User className="w-5 h-5 text-white" />
          : <Bot  className="w-5 h-5 text-medical-600" />
        }
      </div>

      {/* Bubble */}
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed shadow-card
                       ${isUser
                         ? 'bg-gradient-to-br from-medical-500 to-medical-600 text-white rounded-tr-sm'
                         : 'bg-white border border-medical-100 text-slate-700 rounded-tl-sm'
                       }`}>
        {/* Render with basic markdown-like formatting */}
        {msg.content.split('\n').map((line, i) => {
          if (line.startsWith('**') && line.endsWith('**')) {
            return <p key={i} className="font-extrabold mt-1">{line.slice(2, -2)}</p>
          }
          if (line.startsWith('- ') || line.startsWith('• ')) {
            return (
              <p key={i} className="flex gap-2 mt-1.5 font-medium">
                <span className="text-medical-500 flex-shrink-0">•</span>
                <span>{line.slice(2)}</span>
              </p>
            )
          }
          if (line.trim() === '') return <br key={i} />
          return <p key={i} className={i > 0 ? 'mt-1.5' : ''}>{line}</p>
        })}

        {msg.isLoading && (
          <div className="flex items-center gap-2 mt-2">
            <Loader2 className="w-3 h-3 animate-spin text-medical-500" />
            <span className="text-medical-600 font-bold text-[10px] uppercase tracking-widest">Thinking...</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ChatbotPage() {
  const location    = useLocation()
  const drugContext = location.state?.drugContext || null

  const [messages,  setMessages]  = useState([
    {
      role: 'assistant',
      content: drugContext
        ? `Hello! I'm your SafeMedAI assistant. I'm focusing my analysis on **${drugContext}**. I'll reference FAERS data and ROR signals for this specific compound. What would you like to know?`
        : "Hello! I'm your SafeMedAI pharmacovigilance assistant. I can help you understand drug safety signals, ROR scores, adverse reactions, and clinical evidence. What's on your mind?",
    }
  ])
  const [input,     setInput]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text) => {
    const userText = (text || input).trim()
    if (!userText || loading) return

    setInput('')
    setLoading(true)

    const userMsg = { role: 'user', content: userText }
    setMessages(prev => [...prev, userMsg])

    const loadingMsg = { role: 'assistant', content: '', isLoading: true }
    setMessages(prev => [...prev, loadingMsg])

    try {
      const history = messages
        .filter(m => !m.isLoading)
        .map(m => ({ role: m.role, content: m.content }))

      const res = await advancedAPI.chat(userText, history, drugContext)

      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: res.data.reply }
      ])
    } catch (err) {
      setMessages(prev => [
        ...prev.slice(0, -1),
        {
          role: 'assistant',
          content: err.response?.data?.detail ||
            'I encountered a connection error. Please ensure the backend is running and the GOOGLE_API_KEY is configured.'
        }
      ])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  return (
    <Layout title="SafeMedAI Assistant">
      <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-12rem)]">

        {/* Status Header */}
        <div className="flex items-center gap-4 mb-6 animate-safemed-slidein">
          <div className="w-12 h-12 bg-white border border-medical-100 rounded-2xl flex items-center justify-center shadow-soft">
            <Bot className="w-6 h-6 text-medical-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Signal Analysis Engine</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-medical-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-medical-500"></span>
              </span>
              <p className="text-medical-600 font-bold text-[10px] uppercase tracking-widest">
                Gemini 2.0 Flash Active
              </p>
            </div>
          </div>
          {drugContext && (
            <div className="bg-medical-50 border border-medical-200 rounded-xl px-4 py-2 flex items-center gap-2 shadow-soft">
              <Pill className="w-3 h-3 text-medical-500" />
              <span className="text-medical-700 text-xs font-bold capitalize">{drugContext}</span>
            </div>
          )}
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-4 mb-4 scroll-smooth">
          {messages.map((msg, i) => (
            <MessageBubble key={i} msg={msg} />
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input & Suggestions */}
        <div className="bg-white border border-medical-100 rounded-2xl p-4 shadow-soft">
          {messages.length === 1 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {SUGGESTED.map((q, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(q)}
                  className="text-[11px] font-bold bg-medical-50 border border-medical-100
                             hover:border-medical-400 hover:bg-medical-100
                             text-medical-700 px-3 py-1.5 rounded-lg transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Query safety signals, disproportionality data, or interactions..."
              disabled={loading}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl
                         px-5 py-3 text-slate-800 placeholder-slate-400 text-sm
                         focus:outline-none focus:border-medical-500 focus:bg-white
                         disabled:opacity-50 transition-all font-medium"
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="bg-medical-500 hover:bg-medical-600 disabled:opacity-50
                         text-white p-3 rounded-xl transition-all shadow-lg shadow-medical-500/20 active:scale-95"
            >
              {loading
                ? <Loader2 className="w-5 h-5 animate-spin" />
                : <Send className="w-5 h-5" />
              }
            </button>
          </div>
        </div>

      </div>
    </Layout>
  )
}
