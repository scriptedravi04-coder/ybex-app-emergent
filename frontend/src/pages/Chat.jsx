/* eslint-disable */
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";
import { Send, ArrowLeft, MessageCircle } from "lucide-react";

export default function Chat() {
  const { userId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [threads, setThreads] = useState([]);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [otherUser, setOtherUser] = useState(null);
  const scrollRef = useRef(null);
  const lastMsgTime = useRef(null);

  // Load threads list
  useEffect(() => {
    if (!user) return;
    api.get("/chat/threads/list").then(({data}) => setThreads(data)).catch(()=>{});
  }, [user, userId]);

  // Load creator profile if userId given
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    const load = async () => {
      try {
        const { data } = await api.get(`/creators/${userId}`);
        if (!cancelled) setOtherUser({...data, user_id: userId});
      } catch {
        if (!cancelled) setOtherUser({ user_id: userId, name: "User" });
      }
    };
    load();
    return () => { cancelled = true; };
  }, [userId]);

  useEffect(() => {
    if (!userId) setOtherUser(null);
  }, [userId]);

  const appendMessages = useCallback((data) => {
    if (!data || !data.length) return;
    const last = data[data.length - 1]?.created_at;
    if (lastMsgTime.current) {
      setMessages((prev) => [...prev, ...data]);
    } else {
      setMessages(data);
    }
    if (last) lastMsgTime.current = last;
  }, []);

  // Poll messages every 3 seconds
  useEffect(() => {
    if (!userId || !user) return;
    let cancelled = false;
    async function fetchMsgs() {
      try {
        const q = lastMsgTime.current ? `?since=${encodeURIComponent(lastMsgTime.current)}` : "";
        const { data } = await api.get(`/chat/${userId}${q}`);
        if (cancelled) return;
        appendMessages(data);
      } catch (e) { /* ignore */ }
    }
    fetchMsgs();
    const id = setInterval(fetchMsgs, 3000);
    return () => { cancelled = true; clearInterval(id); };
  }, [userId, user, appendMessages]);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!text.trim() || !userId) return;
    try {
      const { data } = await api.post("/chat/send", { to_user_id: userId, text: text.trim() });
      setMessages((m) => [...m, data]);
      lastMsgTime.current = data.created_at;
      setText("");
    } catch (e) { toast.error("Failed to send"); }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-10 py-8" data-testid="chat-page">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-180px)]">
        {/* Thread list */}
        <aside className="card-dark p-0 overflow-y-auto scroll-thin">
          <div className="p-4 border-b border-white/10 sticky top-0 bg-[#13131B] z-10">
            <h2 className="font-display text-xl flex items-center gap-2"><MessageCircle size={18}/> Inbox</h2>
          </div>
          {threads.length === 0 ? (
            <div className="p-6 text-center text-white/40 text-sm">No conversations yet. Start one from a creator profile.</div>
          ) : (
            threads.map((t) => (
              <button key={t._id || t.other_user_id} onClick={()=>navigate(`/chat/${t.other_user_id}`)} data-testid={`thread-${t.other_user_id}`} className={`w-full text-left p-3 border-b border-white/5 hover:bg-white/5 flex gap-3 items-center ${userId===t.other_user_id?"bg-white/5":""}`}>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7C5CFF] to-[#5B3EE0] flex items-center justify-center text-sm font-semibold flex-shrink-0">{(t.other?.name||"?").charAt(0)}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{t.other?.name}</div>
                  <div className="text-xs text-white/40 truncate">{t.last_text}</div>
                </div>
              </button>
            ))
          )}
        </aside>

        {/* Conversation */}
        <main className="md:col-span-2 card-dark p-0 flex flex-col">
          {userId ? (
            <>
              <div className="p-4 border-b border-white/10 flex items-center gap-3">
                <button onClick={()=>navigate("/chat")} className="md:hidden p-1.5 hover:bg-white/5 rounded"><ArrowLeft size={18}/></button>
                <img src={otherUser?.photo || otherUser?.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${otherUser?.name || "U"}`} alt="" className="w-10 h-10 rounded-full object-cover bg-white/10"/>
                <div>
                  <div className="font-semibold">{otherUser?.name || "Loading..."}</div>
                  <div className="text-xs text-white/50">{otherUser?.category || "Active now"}</div>
                </div>
              </div>

              <div ref={scrollRef} className="flex-1 overflow-y-auto scroll-thin p-4 space-y-2">
                {messages.length === 0 && <div className="text-center text-white/40 text-sm mt-12">No messages yet — say hi 👋</div>}
                {messages.map((m) => {
                  const mine = m.from_user_id === user?.user_id;
                  return (
                    <div key={m.message_id} className={`flex ${mine?"justify-end":"justify-start"}`}>
                      <div className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-sm ${mine ? "bg-gradient-to-br from-[#7C5CFF] to-[#5B3EE0] text-white" : "bg-white/8 text-white"}`}>
                        {m.text}
                        <div className={`text-[10px] mt-1 ${mine?"text-white/70":"text-white/40"}`}>{new Date(m.created_at).toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"})}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 border-t border-white/10 flex gap-2">
                <input data-testid="chat-input" value={text} onChange={(e)=>setText(e.target.value)} onKeyDown={(e)=>e.key==="Enter"&&send()} className="input-field flex-1" placeholder="Type a message..."/>
                <button onClick={send} data-testid="chat-send" className="btn-primary"><Send size={16}/></button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-white/40">
              <div className="text-center"><MessageCircle size={48} className="mx-auto opacity-50 mb-3"/><div>Select a conversation</div></div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
