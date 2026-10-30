/**
 * African Wise Warrior Safaris — inbox and chat messaging interface.
 */
import React, { useCallback, useEffect, useState } from 'react';
import {
  MessageSquare, Send, Plus, RefreshCw, Search,
  UserRound, ArrowLeft, Inbox,
} from 'lucide-react';
import { AppUser, Conversation, ConversationChatMessage } from '../types';
import {
  createConversation,
  fetchMessageCustomers,
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
  const [showInbox, setShowInbox] = useState(true);

  const [customerSearch, setCustomerSearch] = useState('');
  const [customers, setCustomers] = useState<Array<{ id: string; displayName: string }>>([]);
  const [targetCustomerId, setTargetCustomerId] = useState('');
  const [firstMessage, setFirstMessage] = useState('');

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const selected = conversations.find((item) => item.id === selectedId);

  const loadConversations = useCallback(async () => {
    try {
      const rows = await fetchConversations();
      setConversations(rows);
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

  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    void loadMessages();

    const timer = window.setInterval(() => {
      void loadMessages();
      void loadConversations();
    }, 10000);

    return () => window.clearInterval(timer);
  }, [loadMessages, loadConversations]);

  const searchCustomers = async (value: string) => {
    setCustomerSearch(value);
    setTargetCustomerId('');
    setCustomers([]);
    setError('');

    if (currentUser.role !== 'admin' || value.trim().length < 2) return;

    try {
      const results = await fetchMessageCustomers(value);
      setCustomers(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not search customers.');
    }
  };

  const startConversation = async (event: React.FormEvent) => {
    event.preventDefault();

    if (currentUser.role === 'admin' && !targetCustomerId) {
      setError('Please search for and select a customer first.');
      return;
    }

    if (currentUser.role === 'admin' && !firstMessage.trim()) {
      setError('Please write the first message to the customer.');
      return;
    }

    setBusy(true);
    setError('');
    setNotice('');

    try {
      const id = await createConversation(
        subject,
        currentUser.role === 'admin' ? targetCustomerId : undefined
      );

      if (currentUser.role === 'admin') {
        await sendConversationChatMessage(id, firstMessage);
      }

      setSubject('');
      setFirstMessage('');
      setCustomerSearch('');
      setCustomers([]);
      setTargetCustomerId('');
      setStarting(false);

      await loadConversations();
      setSelectedId(id);
      setShowInbox(false);
      setNotice('Conversation started successfully.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start conversation.');
    } finally {
      setBusy(false);
    }
  };

  const openConversation = (id: string) => {
    setSelectedId(id);
    setShowInbox(false);
    setStarting(false);
    setDraft('');
    setError('');
    setNotice('');
  };

  const returnToInbox = () => {
    setShowInbox(true);
    setStarting(false);
    setError('');
    setNotice('');
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

  const getConversationName = (conversation: Conversation) => {
    if (currentUser.role === 'admin') {
      return conversation.userName || 'Customer';
    }
    return 'African Wise Warrior Safaris';
  };

  return (
    <section className="min-h-[75vh] bg-[#F5F7F5] px-0 py-0 sm:px-4 sm:py-6">
      <div className="mx-auto max-w-6xl overflow-hidden bg-white shadow-sm sm:rounded-2xl sm:border sm:border-brand-green/15">
        <header className="flex items-center justify-between gap-3 border-b border-stone-200 bg-white px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            {!showInbox && (
              <button
                type="button"
                onClick={returnToInbox}
                aria-label="Back to conversations"
                className="rounded-full p-2 text-stone-700 hover:bg-stone-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-green/10 text-brand-green">
              {showInbox ? <MessageSquare className="h-5 w-5" /> : <UserRound className="h-5 w-5" />}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-green">
                African Wise Warrior Safaris
              </p>
              <h1 className="truncate text-lg font-bold text-stone-900">
                {showInbox
                  ? (currentUser.role === 'admin' ? 'Customer messages' : 'Your messages')
                  : (selected ? getConversationName(selected) : 'Conversation')}
              </h1>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {showInbox && (
              <>
                <button
                  type="button"
                  onClick={() => void loadConversations()}
                  aria-label="Refresh conversations"
                  className="rounded-full p-2 text-stone-600 hover:bg-stone-100"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStarting((value) => !value);
                    setError('');
                    setNotice('');
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-brand-green px-3 py-2 text-sm font-semibold text-white hover:opacity-90"
                >
                  <Plus className="h-4 w-4" />
                  <span>New chat</span>
                </button>
              </>
            )}
          </div>
        </header>

        {error && (
          <p role="alert" className="mx-4 mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700 sm:mx-6">
            {error}
          </p>
        )}
        {notice && (
          <p role="status" className="mx-4 mt-4 rounded-xl bg-green-50 p-3 text-sm text-green-800 sm:mx-6">
            {notice}
          </p>
        )}

        {showInbox && (
          <div className="min-h-[65vh] bg-white">
            {starting && (
              <form onSubmit={startConversation} className="space-y-4 border-b border-stone-200 bg-stone-50 p-4 sm:p-6">
                {currentUser.role === 'admin' && (
                  <div>
                    <label htmlFor="customer-search" className="mb-2 block text-sm font-semibold text-stone-800">
                      Find customer by name
                    </label>
                    <div className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 focus-within:border-brand-green">
                      <Search className="h-4 w-4 shrink-0 text-stone-500" />
                      <input
                        id="customer-search"
                        value={customerSearch}
                        onChange={(event) => void searchCustomers(event.target.value)}
                        autoComplete="off"
                        placeholder="Type at least 2 letters…"
                        className="min-w-0 flex-1 py-3 text-sm outline-none"
                      />
                    </div>

                    {targetCustomerId && (
                      <p className="mt-2 text-sm font-semibold text-brand-green">
                        Selected: {customerSearch}
                      </p>
                    )}

                    {customers.length > 0 && !targetCustomerId && (
                      <div className="mt-2 max-h-52 overflow-y-auto rounded-xl border border-stone-200 bg-white">
                        {customers.map((customer) => (
                          <button
                            key={customer.id}
                            type="button"
                            onClick={() => {
                              setTargetCustomerId(customer.id);
                              setCustomerSearch(customer.displayName);
                              setCustomers([]);
                            }}
                            className="flex w-full items-center gap-3 border-b border-stone-100 px-3 py-3 text-left last:border-0 hover:bg-stone-50"
                          >
                            <UserRound className="h-5 w-5 text-brand-green" />
                            <span className="text-sm font-medium text-stone-800">{customer.displayName}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    {customerSearch.trim().length >= 2 && customers.length === 0 && !targetCustomerId && !error && (
                      <p className="mt-2 text-xs text-stone-500">No matching customers found. Try another name.</p>
                    )}
                  </div>
                )}

                <div>
                  <label htmlFor="chat-subject" className="mb-2 block text-sm font-semibold text-stone-800">
                    Conversation subject
                  </label>
                  <input
                    id="chat-subject"
                    value={subject}
                    onChange={(event) => setSubject(event.target.value)}
                    maxLength={160}
                    required
                    placeholder="e.g. Safari package enquiry"
                    className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-green"
                  />
                </div>

                {currentUser.role === 'admin' && (
                  <div>
                    <label htmlFor="first-chat-message" className="mb-2 block text-sm font-semibold text-stone-800">
                      First message
                    </label>
                    <textarea
                      id="first-chat-message"
                      value={firstMessage}
                      onChange={(event) => setFirstMessage(event.target.value)}
                      maxLength={5000}
                      rows={3}
                      required
                      placeholder="Write a message to this customer…"
                      className="w-full resize-y rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-green"
                    />
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <button
                    type="submit"
                    disabled={busy}
                    className="rounded-full bg-brand-green px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {busy ? 'Starting…' : currentUser.role === 'admin' ? 'Start chat and send message' : 'Start conversation'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStarting(false)}
                    className="rounded-full border border-stone-300 px-5 py-2.5 text-sm font-semibold text-stone-600"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="border-b border-stone-100 px-4 py-3 sm:px-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                {conversations.length} conversation{conversations.length === 1 ? '' : 's'}
              </p>
            </div>

            {conversations.length === 0 ? (
              <div className="flex min-h-[45vh] flex-col items-center justify-center px-6 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-green/10 text-brand-green">
                  <Inbox className="h-8 w-8" />
                </div>
                <h2 className="font-semibold text-stone-800">No messages yet</h2>
                <p className="mt-2 max-w-sm text-sm text-stone-500">
                  {currentUser.role === 'admin'
                    ? 'Customer conversations will appear here when they contact your team.'
                    : 'Start a conversation with our safari team whenever you need assistance.'}
                </p>
              </div>
            ) : (
              <div>
                {conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => openConversation(conversation.id)}
                    className="flex w-full items-center gap-3 border-b border-stone-100 px-4 py-4 text-left transition hover:bg-stone-50 sm:px-6"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-green/10 text-brand-green">
                      <UserRound className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <span className="truncate text-sm font-bold text-stone-900">
                          {getConversationName(conversation)}
                        </span>
                        <span className="shrink-0 text-[10px] text-stone-500">
                          {new Date(conversation.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-sm text-stone-600">{conversation.subject}</p>
                      <p className="mt-1 text-xs text-stone-400">
                        {new Date(conversation.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <MessageSquare className="h-4 w-4 shrink-0 text-brand-green/60" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {!showInbox && (
          <div className="flex min-h-[70vh] flex-col bg-[#F8FAF8]">
            <div className="border-b border-stone-200 bg-white px-4 py-3 sm:px-6">
              <p className="truncate text-sm font-semibold text-stone-900">
                {selected?.subject || 'Conversation'}
              </p>
              <p className="mt-1 text-xs text-stone-500">
                {currentUser.role === 'admin'
                  ? `Customer: ${selected?.userName || 'Customer'}`
                  : 'African Wise Warrior Safaris support team'}
                {' · '}Messages refresh automatically
              </p>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-6">
              {!selected && (
                <p className="py-10 text-center text-sm text-stone-500">
                  Conversation not found. Return to your inbox and select another chat.
                </p>
              )}
              {selected && messages.length === 0 && (
                <p className="py-10 text-center text-sm text-stone-500">
                  No messages yet. Send the first message below.
                </p>
              )}
              {messages.map((message) => {
                const mine = message.senderId === currentUser.uid;
                return (
                  <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[88%] rounded-2xl px-4 py-3 shadow-sm sm:max-w-[75%] ${
                      mine
                        ? 'rounded-br-md bg-brand-green text-white'
                        : 'rounded-bl-md border border-stone-200 bg-white text-stone-800'
                    }`}>
                      <p className="mb-1 text-[10px] font-bold uppercase tracking-wider opacity-70">
                        {mine ? 'You' : message.senderRole === 'admin' ? 'Safari team' : 'Customer'}
                      </p>
                      <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{message.message}</p>
                      <p className="mt-2 text-right text-[10px] opacity-65">
                        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {selected && (
              <form onSubmit={sendMessage} className="flex items-end gap-2 border-t border-stone-200 bg-white p-3 sm:p-4">
                <textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  maxLength={5000}
                  required
                  rows={2}
                  placeholder="Write a message…"
                  className="min-w-0 flex-1 resize-y rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none focus:border-brand-green"
                />
                <button
                  type="submit"
                  disabled={busy || !draft.trim()}
                  aria-label="Send message"
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-green text-white disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            )}
          </div>
        )}

        <footer className="border-t border-stone-100 bg-white px-4 py-3 sm:px-6">
          <button onClick={onBack} className="text-sm font-semibold text-brand-green hover:underline">
            ← Back to safaris
          </button>
        </footer>
      </div>
    </section>
  );
}
