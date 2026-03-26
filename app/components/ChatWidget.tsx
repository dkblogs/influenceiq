"use client"
import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { formatIST } from "@/lib/utils"

interface ChatWidgetProps {
  proposalId: string
  currentUserId: string
  currentUserRole: "brand" | "influencer"
  currentUserName: string
  otherPartyName: string
}

export default function ChatWidget({ proposalId, currentUserId, currentUserRole, otherPartyName }: ChatWidgetProps) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [unread, setUnread] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load messages on mount
  useEffect(() => {
    fetch(`/api/proposals/${proposalId}/messages`)
      .then(r => r.json())
      .then(data => setMessages(data.messages || []))
  }, [proposalId])

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel(`chat-widget-${proposalId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "ProposalMessage",
        filter: `proposalId=eq.${proposalId}`,
      }, (payload) => {
        const incoming = payload.new as any
        setMessages(prev => {
          if (incoming.senderId === currentUserId || incoming.senderRole === currentUserRole) {
            // Replace the temp message with the real one
            const withoutTemp = prev.filter(m => !m.temp)
            if (withoutTemp.find(m => m.id === incoming.id)) return withoutTemp
            return [...withoutTemp, incoming]
          }
          // Message from other party — add if not duplicate
          if (prev.find(m => m.id === incoming.id)) return prev
          return [...prev, incoming]
        })
        if (!open) setUnread(prev => prev + 1)
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [proposalId, open])

  // Auto scroll and clear unread when open
  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
      setUnread(0)
    }
  }, [messages, open])

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return
    setSending(true)
    const tempId = `temp-${Date.now()}`
    const tempMsg = {
      id: tempId,
      message: newMessage.trim(),
      senderRole: currentUserRole,
      senderId: currentUserId,
      createdAt: new Date().toISOString(),
      temp: true,
    }
    setMessages(prev => [...prev, tempMsg])
    const sentText = newMessage.trim()
    setNewMessage("")
    await fetch(`/api/proposals/${proposalId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: sentText }),
    })
    setSending(false)
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => { setOpen(o => !o); setUnread(0) }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-purple-600 hover:bg-purple-500 rounded-full shadow-lg shadow-purple-500/30 flex items-center justify-center transition-all"
        aria-label="Toggle chat"
      >
        {open ? (
          <span className="text-white text-xl leading-none">✕</span>
        ) : (
          <>
            <span className="text-white text-xl leading-none">💬</span>
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-bold">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-[#0D0D14] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 flex flex-col overflow-hidden"
          style={{ height: "480px" }}
        >
          {/* Header */}
          <div className="p-4 border-b border-white/10 bg-purple-600/10 flex-shrink-0">
            <p className="text-white font-medium text-sm">💬 Chat with {otherPartyName}</p>
            <p className="text-white/40 text-xs mt-0.5">Messages are real-time</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
            {messages.length === 0 && (
              <p className="text-white/30 text-sm text-center mt-8">No messages yet. Start the conversation!</p>
            )}
            {messages.map((msg, i) => {
              const isMe = msg.senderId === currentUserId
              return (
                <div key={msg.id || i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                    isMe
                      ? "bg-purple-600 text-white rounded-br-sm"
                      : "bg-white/10 text-white/90 rounded-bl-sm"
                  } ${msg.temp ? "opacity-70" : ""}`}>
                    <p>{msg.message}</p>
                    <p className={`text-xs mt-1 ${isMe ? "text-purple-200" : "text-white/40"}`}>
                      {formatIST(msg.createdAt)}
                    </p>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-white/10 flex-shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50"
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim() || sending}
                className="bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white px-3 py-2 rounded-xl text-sm transition-colors"
              >
                {sending ? "..." : "→"}
              </button>
            </div>
            <p className="text-white/20 text-xs mt-1 text-center">Press Enter to send</p>
          </div>
        </div>
      )}
    </>
  )
}
