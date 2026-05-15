import { useState, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Pill, 
  Terminal, 
  Database,
  BrainCircuit
} from 'lucide-react'
import Layout from '../../components/Layout'
import { advancedAPI } from '../../services/api'

const SUGGESTED = [
  "What are contraindications for [drug] in elderly patients?",
  "How do I assess causality in an adverse event report?",
  "What is the WHO-UMC causality assessment system?",
  "When should I report an adverse event to pharmacovigilance?",
  "What are the signs of drug-induced liver injury?",
]

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex gap-5 animate-in fade-in duration-500 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-1 border
                       ${isUser ? 'bg-teal-500/20 border-teal-500/30' : 'bg-slate-800/50 border-slate-700'}`}>
        {isUser
          ? <User className="w-6 h-6 text-teal-400" />
          : <Bot  className="w-6 h-6 text-teal-500 animate-pulse" />
        }
      </div>

      {/* Bubble */}
      <div className={`max-w-[85%] p-5 rounded-2xl transition-all duration-300 border
                       ${isUser
                         ? 'bg-teal-500/10 border-teal-500/20 rounded-tr-none'
                         : 'bg-slate-900/50 border-slate-800 rounded-tl-none'
                       }`}>
        <div className="space-y-3">
          {msg.content.split('\n').map((line, i) => {
            if (line.startsWith('**') && line.endsWith('**')) {
              return <p key={i} className="text-white font-bold text-base tracking-tight">{line.slice(2, -2)}</p>
            }
            if (line.startsWith('- ') || line.startsWith('• ')) {
              return (
                <div key={i} className="flex gap-3 items-start group">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                  <p className="text-slate-300 text-sm leading-relaxed">{line.slice(2)}</p>
                </div>
              )
            }
            if (line.trim() === '') return <div key={i} className="h-2" />
            return <p key={i} className="text-slate-300 text-sm leading-relaxed">{line}</p>
          })}
        </div>

        {msg.isLoading && (
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/5">
            <Loader2 className="w-4 h-4 animate-spin text-teal-500" />
            <span className="text-teal-500 font-bold text-[10px] uppercase tracking-[0.2em]">Analyzing Clinical Context...</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default function DoctorChatbot() {
  const location    = useLocation()
  const drugContext = location.state?.drugContext || null

  const [messages,  setMessages]  = useState([
    {
      role: 'assistant',
      content: drugContext
        ? `I have initialized clinical support for **${drugContext}**. How can I assist with your safety assessment or causality analysis for this compound?`
        : "Welcome, Doctor. I am the SafeMedAI Clinical Assistant. I can help with drug safety assessment, causality interpretation, and clinical decision support. How can I help you today?",
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
            'Connection error. Please try again later.'
        }
      ])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  return (
    <Layout title="Clinical Intelligence Assistant">
      <div className="max-w-5xl mx-auto flex flex-col h-[calc(100vh-14rem)] animate-in fade-in duration-700">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-6 mb-8">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-teal-500/10 border border-teal-500/20 rounded-2xl flex items-center justify-center shadow-glow-teal/10">
              <BrainCircuit className="w-7 h-7 text-teal-500 animate-pulse" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Clinical <span className="text-teal-400">AI</span> Assistant</h2>
              <div className="flex items-center gap-3 mt-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">Active Clinical Logic</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-slate-700" />
                <div className="flex items-center gap-2">
                  <Terminal className="w-3 h-3 text-slate-500" />
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-tighter">CLAUDE-3.5-SONNET-PHYSICIAN</span>
                </div>
              </div>
            </div>
          </div>
          {drugContext && (
            <div className="hidden lg:flex items-center gap-3 bg-teal-500/10 border border-teal-500/20 rounded-xl px-5 py-2.5 shadow-glow-teal/5">
              <Pill className="w-4 h-4 text-teal-400" />
              <span className="text-teal-400 text-xs font-bold uppercase tracking-widest leading-none">{drugContext}</span>
              <div className="w-1 h-1 rounded-full bg-teal-500/40" />
              <span className="text-[9px] font-bold text-teal-500/60 uppercase">Context Locked</span>
            </div>
          )}
        </div>

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto space-y-8 pr-6 mb-8 custom-scrollbar">
          {messages.map((msg, i) => (
            <MessageBubble key={i} msg={msg} />
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input Section */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-2 backdrop-blur-sm shadow-xl">
          {messages.length === 1 && (
            <div className="flex flex-wrap gap-2 p-4 border-b border-slate-800 mb-2">
              {SUGGESTED.map((q, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(q)}
                  className="text-[10px] font-bold bg-slate-800/50 border border-slate-700
                             hover:border-teal-500/40 hover:bg-teal-500/10
                             text-slate-400 hover:text-teal-400 px-4 py-2 rounded-full transition-all uppercase tracking-tighter"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-3 p-3">
            <div className="flex-1 relative group">
              <Database className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-teal-400 transition-colors" />
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Ask about contraindications, causality assessments, or clinical guidelines..."
                disabled={loading}
                className="w-full bg-slate-950 border border-transparent rounded-xl
                           pl-14 pr-6 py-4 text-white placeholder-slate-600 text-sm
                           focus:outline-none focus:border-teal-500/30
                           disabled:opacity-50 transition-all font-medium"
              />
            </div>
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="bg-teal-600 hover:bg-teal-500 text-white px-8 py-4 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 active:scale-95 disabled:opacity-50"
            >
              {loading
                ? <Loader2 className="w-5 h-5 animate-spin" />
                : <Send className="w-5 h-5" />
              }
              <span className="hidden md:inline uppercase tracking-widest text-xs font-bold">Inquire</span>
            </button>
          </div>
        </div>

      </div>
    </Layout>
  )
}
