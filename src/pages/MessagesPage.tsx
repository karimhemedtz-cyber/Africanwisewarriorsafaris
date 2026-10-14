/**
 * African Wise Warrior Safaris — secure authenticated messaging.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { MessageSquare, Send, Plus, RefreshCw } from 'lucide-react';
import { AppUser, Conversation, ConversationChatMessage } from '../types';
import {
  createConversation,
  fetchConversations,
  fetchConversationMessages,
  sendConversationChatMessage,
} from '../supabase-db';

interface MessagesPageProps {
  currentUser: AppUser;
  onBack: () => void;
}

export default function MessagesPage({ currentUser, onBack }: MessagesPageProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [messages, setMessages] = useState<ConversationChatMessage[]>([]);
  const [subject, setSubject] = useState('');
  const [draft, setDraft] = useState('');
  const [starting, setStarting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const selected = conversations.find((item) => item.id === selectedId);

  const loadConversations = useCallback(async () => {
    try {
      const rows = await fetchConversations();
      setConversations(rows);
      setSelectedId((old) => old && rows.some((row) => row.id === old) ? old : (rows[0]?.id || ''));
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load conversations.');
    }
  }, []);

  const loadMessages = useCallback(async () => {
    if (!selectedId) {
      setMessages([]);
      return;
    }
    try {
      const rows = await fetchConversationMessages(selectedId);
      setMessages(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load messages.');
    }
  }, [selectedId]);

  useEffect(() => { void loadConversations(); }, [loadConversations]);
  useEffect(() => {
    void loadMessages();
    const timer = window.setInterval(() => { void loadMessages(); void loadConversations(); }, 10000);
    return () => window.clearInterval(timer);
  }, [loadMessages, loadConversations]);

  const startConversation = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const id = await createConversation(subject);
      setSubject('');
      setStarting(false);
      await loadConversations();
      setSelectedId(id);
      setNotice('Conversation started. You can now send your message.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start conversation.');
    } finally {
      setBusy(false);
    }
  };

  const sendMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedId || !draft.trim()) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await sendConversationChatMessage(selectedId, draft);
      setDraft('');
      await loadMessages();
      await loadConversations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send message.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="min-h-[70vh] bg-[#FDFCF8] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-green">Customer support</p>
            <h1 className="mt-1 font-serif text-3xl font-bold text-brand-dark">Messages</h1>
            <p className="mt-2 text-sm text-stone-600">
              Chat with the African Wise Warrior Safaris team.
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { void loadConversations(); void loadMessages(); }}
              className="inline-flex items-center gap-2 rounded-full border border-brand-green/20 px-4 py-2 text-sm font-semibold text-brand-green">
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
            {currentUser.role === 'user' && (
              <button onClick={() => { setStarting((value) => !value); setError(''); }}
                className="inline-flex items-center gap-2 rounded-full bg-brand-green px-4 py-2 text-sm font-semibold text-white">
                <Plus className="h-4 w-4" /> New chat
              </button>
            )}
          </div>
        </div>

        {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {notice && <p role="status" className="mb-4 rounded-xl bg-green-50 p-3 text-sm text-green-800">{notice}</p>}

        {starting && currentUser.role === 'user' && (
          <form onSubmit={startConversation} className="mb-5 rounded-2xl border border-brand-green/15 bg-white p-4 shadow-sm">
            <label className="mb-2 block text-sm font-semibold text-stone-800" htmlFor="chat-subject">What would you like to discuss?</label>
            <input id="chat-subject" value={subject} onChange={(event) => setSubject(event.target.value)}
              maxLength={160} required placeholder="e.g. Safari package enquiry"
              className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-brand-green" />
            <button disabled={busy} className="mt-3 rounded-full bg-brand-green px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">
              {busy ? 'Starting…' : 'Start conversation'}
            </button>
          </form>
        )}

        <div className="grid min-h-[460px] overflow-hidden rounded-2xl border border-brand-green/15 bg-white shadow-sm md:grid-cols-[280px_1fr]">
          <aside className="border-b border-brand-green/10 bg-stone-50 md:border-b-0 md:border-r">
            <div className="border-b border-brand-green/10 px-4 py-4">
              <h2 className="font-semibold text-stone-800">
                {currentUser.role === 'admin' ? 'Customer conversations' : 'Your conversations'}
              </h2>
            </div>
            {conversations.length === 0 ? (
              <p className="p-5 text-sm text-stone-500">
                {currentUser.role === 'admin' ? 'No conversations yet.' : 'Start a new chat to contact our team.'}
              </p>
            ) : conversations.map((conversation) => (
              <button key={conversation.id} onClick={() => { setSelectedId(conversation.id); setNotice(''); }}
                className={`block w-full border-b border-brand-green/10 px-4 py-4 text-left ${selectedId === conversation.id ? 'bg-brand-green/10' : 'hover:bg-white'}`}>
                <span className="flex items-center gap-2 text-sm font-semibold text-stone-800">
                  <MessageSquare className="h-4 w-4 shrink-0 text-brand-green" />
                  <span className="break-words">{conversation.subject}</span>
                </span>
                <span className="mt-1 block text-xs text-stone-500">
                  Updated {new Date(conversation.updatedAt).toLocaleString()}
                </span>
              </button>
            ))}
          </aside>

          <div className="flex min-h-[460px] flex-col">
            <div className="border-b border-brand-green/10 px-4 py-4">
              <h2 className="font-semibold text-stone-900">{selected?.subject || 'Choose a conversation'}</h2>
              <p className="mt-1 text-xs text-stone-500">Messages refresh automatically every 10 seconds.</p>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4 sm:p-6">
              {!selected && <p className="py-10 text-center text-sm text-stone-500">Select a conversation or start a new chat.</p>}
              {selected && messages.length === 0 && <p className="py-10 text-center text-sm text-stone-500">No messages yet. Send the first message below.</p>}
              {messages.map((message) => {
                const mine = message.senderId === currentUser.uid;
                return (
                  <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${mine ? 'bg-brand-green text-white' : 'bg-stone-100 text-stone-800'}`}>
                      <p className="mb-1 text-[10px] font-bold uppercase tracking-wider opacity-75">
                        {mine ? 'You' : message.senderRole === 'admin' ? 'Safari team' : 'Customer'}
                      </p>
                      <p className="whitespace-pre-wrap break-words text-sm">{message.message}</p>
                      <p className="mt-2 text-right text-[10px] opacity-70">{new Date(message.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            {selected && (
              <form onSubmit={sendMessage} className="flex items-end gap-2 border-t border-brand-green/10 p-3 sm:p-4">
                <textarea value={draft} onChange={(event) => setDraft(event.target.value)}
                  maxLength={5000} required rows={2} placeholder="Write your message…"
                  className="min-w-0 flex-1 resize-y rounded-xl border border-stone-200 px-3 py-3 text-sm outline-none focus:border-brand-green" />
                <button type="submit" disabled={busy || !draft.trim()}
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-brand-green px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">
                  <Send className="h-4 w-4" /><span className="hidden sm:inline">{busy ? 'Sending…' : 'Send'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
        <button onClick={onBack} className="mt-5 text-sm font-semibold text-brand-green hover:underline">← Back to safaris</button>
      </div>
    </section>
  );
}
