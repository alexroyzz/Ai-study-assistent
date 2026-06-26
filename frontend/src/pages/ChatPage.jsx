
//ChatPage - Chat with PDF (Q&A)

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useParams, Link, useNavigate } from 'react-router-dom';
import { Send, MessageSquare, Plus, Trash2, FileText, Bot, User, ChevronDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { chatAPI, documentAPI } from '../services/api';
import { EmptyState, Spinner, ConfirmModal } from '../components/common/index.jsx';
import { formatDistanceToNow } from '../utils/helpers';
import toast from 'react-hot-toast';

const ChatPage = () => {
  const [searchParams] = useSearchParams();
  const { id: chatId } = useParams();
  const navigate = useNavigate();

  const [documents, setDocuments] = useState([]);
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState(searchParams.get('documentId') || '');
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ open: false, chat: null });
  const [showDocSelect, setShowDocSelect] = useState(false);
  const messagesEndRef = useRef(null);


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docsRes, chatsRes] = await Promise.all([
          documentAPI.getAll({ limit: 50 }),
          chatAPI.getAll({ limit: 20 }),
        ]);
        setDocuments(docsRes.data.documents);
        setChats(chatsRes.data.chats);
      } catch {
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);


  useEffect(() => {
    if (chatId) {
      const loadChat = async () => {
        try {
          const { data } = await chatAPI.getOne(chatId);
          setActiveChat(data.chat);
          setMessages(data.chat.messages || []);
          setSelectedDocId(data.chat.document?._id || '');
        } catch {
          navigate('/chat');
        }
      };
      loadChat();
    }
  }, [chatId]);

  const handleSend = async () => {
    if (!input.trim()) return;
    if (!selectedDocId) {
      toast.error('Please select a document to chat with');
      setShowDocSelect(true);
      return;
    }

    const userMessage = { role: 'user', content: input.trim(), timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setSending(true);

    try {
      const { data } = await chatAPI.sendMessage({
        documentId: selectedDocId,
        message: userMessage.content,
        chatId: activeChat?._id || null,
      });

      
      if (!activeChat) {
        setActiveChat({ _id: data.chatId });
        // Refresh chat list
        const chatsRes = await chatAPI.getAll({ limit: 20 });
        setChats(chatsRes.data.chats);
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message.content,
        timestamp: data.message.timestamp,
      }]);
    } catch (err) {
      toast.error(err.message || 'Failed to get response');
      setMessages(prev => prev.slice(0, -1)); // Remove the user message on error
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const startNewChat = () => {
    setActiveChat(null);
    setMessages([]);
    navigate('/chat');
    setShowDocSelect(true);
  };

  const loadChat = async (chat) => {
    try {
      const { data } = await chatAPI.getOne(chat._id);
      setActiveChat(data.chat);
      setMessages(data.chat.messages || []);
      setSelectedDocId(data.chat.document?._id || '');
      navigate(`/chat/${chat._id}`);
    } catch {
      toast.error('Failed to load chat');
    }
  };

  const handleDeleteChat = async () => {
    try {
      await chatAPI.delete(deleteModal.chat._id);
      setChats(prev => prev.filter(c => c._id !== deleteModal.chat._id));
      if (activeChat?._id === deleteModal.chat._id) {
        setActiveChat(null);
        setMessages([]);
        navigate('/chat');
      }
      toast.success('Chat deleted');
    } catch {
      toast.error('Failed to delete chat');
    } finally {
      setDeleteModal({ open: false, chat: null });
    }
  };

  const selectedDoc = documents.find(d => d._id === selectedDocId);

  return (
    <div className="h-[calc(100vh-9rem)] flex gap-4 animate-fade-in">
      
      <div className="w-64 flex-shrink-0 hidden lg:flex flex-col card !p-3 gap-2">
        <button onClick={startNewChat} className="btn-primary w-full justify-center text-sm py-2">
          <Plus size={14} /> New Chat
        </button>

        <div className="flex-1 overflow-y-auto space-y-1">
          {loading ? (
            <div className="space-y-2 mt-2">
              {[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-dark-300 rounded-lg animate-pulse" />)}
            </div>
          ) : chats.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-6">No chats yet</p>
          ) : (
            chats.map(chat => (
              <div
                key={chat._id}
                onClick={() => loadChat(chat)}
                className={`group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                  activeChat?._id === chat._id
                    ? 'bg-brand-500/20 border border-brand-500/30'
                    : 'hover:bg-dark-300'
                }`}
              >
                <MessageSquare size={13} className="text-gray-500 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-300 truncate">{chat.title}</p>
                  <p className="text-xs text-gray-600">{formatDistanceToNow(chat.createdAt)}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setDeleteModal({ open: true, chat }); }}
                  className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

    
      <div className="flex-1 flex flex-col card !p-0 overflow-hidden">
        {/* Chat header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800/50 flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <Bot size={18} className="text-brand-400 flex-shrink-0" />
            <span className="text-sm font-medium text-white truncate">
              {activeChat ? activeChat.title : 'New Chat'}
            </span>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowDocSelect(!showDocSelect)}
              className="flex items-center gap-2 text-xs text-gray-400 hover:text-white bg-dark-300 px-3 py-1.5 rounded-lg border border-gray-700 hover:border-gray-500 transition-all"
            >
              <FileText size={12} />
              <span className="hidden sm:block max-w-[120px] truncate">
                {selectedDoc ? selectedDoc.title : 'Select PDF'}
              </span>
              <ChevronDown size={12} />
            </button>

            {showDocSelect && (
              <div className="absolute right-0 top-9 bg-dark-100 border border-gray-700 rounded-xl shadow-2xl z-20 w-64 max-h-64 overflow-y-auto">
                {documents.length === 0 ? (
                  <div className="p-4 text-center">
                    <p className="text-sm text-gray-400 mb-2">No PDFs uploaded</p>
                    <Link to="/upload" className="text-xs text-brand-400">Upload one →</Link>
                  </div>
                ) : (
                  documents.map(doc => (
                    <button
                      key={doc._id}
                      onClick={() => { setSelectedDocId(doc._id); setShowDocSelect(false); }}
                      className={`w-full text-left px-4 py-3 text-sm hover:bg-dark-300 transition-colors border-b border-gray-800/50 last:border-0 ${
                        selectedDocId === doc._id ? 'text-brand-400 bg-brand-500/10' : 'text-gray-300'
                      }`}
                    >
                      <p className="truncate">{doc.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{doc.originalName}</p>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-2xl bg-brand-500/20 flex items-center justify-center mb-4">
                <MessageSquare size={28} className="text-brand-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Chat with your PDF</h3>
              <p className="text-gray-500 text-sm max-w-sm mb-4">
                Select a document above and ask any question about its content. The AI will answer based only on your PDF.
              </p>
              {!selectedDocId && (
                <button
                  onClick={() => setShowDocSelect(true)}
                  className="btn-primary text-sm"
                >
                  <FileText size={14} /> Select a PDF
                </button>
              )}
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''} animate-slide-up`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-full bg-brand-500/30 flex items-center justify-center flex-shrink-0">
                      <Bot size={14} className="text-brand-400" />
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                    msg.role === 'user'
                      ? 'bg-brand-500 text-white rounded-tr-sm'
                      : 'bg-dark-100 border border-gray-800 text-gray-200 rounded-tl-sm'
                  }`}>
                    {msg.role === 'assistant' ? (
                      <div className="markdown-content prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p>{msg.content}</p>
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                      <User size={14} className="text-gray-300" />
                    </div>
                  )}
                </div>
              ))}

              
              {sending && (
                <div className="flex items-start gap-3 animate-slide-up">
                  <div className="w-7 h-7 rounded-full bg-brand-500/30 flex items-center justify-center flex-shrink-0">
                    <Bot size={14} className="text-brand-400" />
                  </div>
                  <div className="bg-dark-100 border border-gray-800 rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        
        <div className="px-4 py-3 border-t border-gray-800/50 flex-shrink-0">
          {selectedDoc && (
            <p className="text-xs text-gray-600 mb-2 flex items-center gap-1">
              <FileText size={10} />
              Chatting about: <span className="text-gray-500">{selectedDoc.title}</span>
            </p>
          )}
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={selectedDocId ? 'Ask anything about the document... (Enter to send)' : 'Select a PDF first...'}
              disabled={sending || !selectedDocId}
              rows={1}
              className="input flex-1 resize-none min-h-[42px] max-h-32 py-2.5"
              style={{ height: 'auto' }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
              }}
            />
            <button
              onClick={handleSend}
              disabled={sending || !input.trim() || !selectedDocId}
              className="btn-primary px-3 py-2.5 self-end"
            >
              {sending ? <Spinner size="sm" /> : <Send size={18} />}
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteModal.open}
        title="Delete Chat"
        message="Delete this chat session? All messages will be lost."
        onConfirm={handleDeleteChat}
        onCancel={() => setDeleteModal({ open: false, chat: null })}
      />
    </div>
  );
};

export default ChatPage;
