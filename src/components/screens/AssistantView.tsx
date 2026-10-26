import React, { useState } from 'react';
import { useVault } from '../../context/VaultContext';
import { 
  Bot, 
  Send, 
  History, 
  Sparkles, 
  Cpu, 
  Paperclip, 
  FileText, 
  CheckCircle2, 
  ArrowRight, 
  Layers, 
  Plus, 
  ChevronRight, 
  RotateCcw, 
  Check, 
  ShieldCheck, 
  FileCheck,
  Search,
  KeyRound
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text: string;
  structuredCard?: {
    title: string;
    fields: { label: string; value: string; verified?: boolean }[];
    actionLabel?: string;
    targetScreen?: string;
  };
}

export const AssistantView: React.FC = () => {
  const { setCurrentScreen, setActiveDocId, showToast, documents } = useVault();

  const [activeModel, setActiveModel] = useState<'qwen' | 'vision' | 'claude'>('qwen');
  const [inputText, setInputText] = useState('');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'assistant',
      timestamp: '14:32',
      text: 'Здравствуйте! Я локальный ассистент PersonalVault 2.0. Работаю на базе модели Ollama Qwen2.5-Coder без передачи персональных данных во внешние сети. Могу помочь классифицировать документы, извлечь табличные данные, сверить реквизиты или заполнить шаблон.'
    },
    {
      id: 'm2',
      sender: 'user',
      timestamp: '14:33',
      text: 'Проверь загруженный скан «Акт приема-передачи квартиры от 15.03.2024» на соответствие шаблону недвижимости и сверь данные паспорта.'
    },
    {
      id: 'm3',
      sender: 'assistant',
      timestamp: '14:33',
      text: 'Проанализировал документ. Текст распознан с точностью 99.4%. Реквизиты паспорта совпадают с реестром «Мои данные». Все обязательные поля шаблона заполнены.',
      structuredCard: {
        title: 'Результат сверки: Акт приема-передачи квартиры',
        fields: [
          { label: 'Субъект', value: 'Иванов Иван Сергеевич', verified: true },
          { label: 'Паспорт РФ', value: '4510 987654 (СОВПАЛ)', verified: true },
          { label: 'Объект', value: 'г. Москва, ул. Ленина, д. 42, кв. 15', verified: true },
          { label: 'Сумма взаиморасчетов', value: '14 250 000 ₽', verified: true }
        ],
        actionLabel: 'Открыть карточку в сплит-редакторе',
        targetScreen: 'SCR-06'
      }
    }
  ]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString().slice(0, 5),
      text: inputText.trim()
    };

    setMessages(prev => [...prev, userMsg]);
    const query = inputText.trim().toLowerCase();
    setInputText('');

    // Simulated contextual response
    setTimeout(() => {
      let replyText = 'Запрос обработан локальной нейросетью. ';
      let card = undefined;

      if (query.includes('анализ') || query.includes('кров') || query.includes('здоров')) {
        replyText += 'Найдены актуальные показатели ферритина (68.4 мкг/л) и гемоглобина (148 г/л) в Сводке здоровья. Показатели в пределах нормы.';
        card = {
          title: 'Медицинские данные: Биохимический анализ',
          fields: [
            { label: 'Ферритин', value: '68.4 мкг/л (Норма 30-150)', verified: true },
            { label: 'Гемоглобин', value: '148 г/л (Норма 130-160)', verified: true },
            { label: 'Динамика', value: 'Положительный прирост +44.3', verified: true }
          ],
          actionLabel: 'Перейти в Сводку здоровья',
          targetScreen: 'SCR-19'
        };
      } else if (query.includes('паспорт') || query.includes('данные')) {
        replyText += 'В реестре «Мои данные» зафиксирован паспорт 4510 987654 и СНИЛС 123-456-789 00. Все реквизиты подтверждены оригиналами.';
        card = {
          title: 'Справочник реквизитов субъекта',
          fields: [
            { label: 'ФИО', value: 'Иванов Иван Сергеевич', verified: true },
            { label: 'СНИЛС', value: '123-456-789 00', verified: true },
            { label: 'Паспорт', value: 'Серия 4510 № 987654', verified: true }
          ],
          actionLabel: 'Открыть «Мои данные»',
          targetScreen: 'SCR-14'
        };
      } else {
        replyText += `Выполнен семантический поиск по ${documents.length} архивным документам. Найдено 3 релевантных совпадения в открытом хранилище. Конфиденциальные тома защищены.`;
      }

      setMessages(prev => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString().slice(0, 5),
          text: replyText,
          structuredCard: card
        }
      ]);
    }, 700);
  };

  const quickPrompts = [
    'Сверить реквизиты паспорта с договором найма',
    'Проверить динамику ферритина в анализах',
    'Найти документы с истекающим сроком действия',
    'Показать статус целостности архива SQLite'
  ];

  return (
    <div className="flex flex-col w-full text-[#111d23] gap-3">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
            title="История диалогов"
          >
            <History className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <Bot className="w-5 h-5 text-[#006763]" />
              Интеллектуальный помощник (AI Assistant)
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Семантический поиск, извлечение фактов и валидация архива с гарантией приватности.
            </p>
          </div>
        </div>

        {/* Model Switcher */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs shrink-0 flex-wrap">
          <Cpu className="w-3.5 h-3.5 text-[#006763] ml-1.5 hidden sm:block" />
          <button
            onClick={() => {
              setActiveModel('qwen');
              showToast('Модель: Ollama · Qwen2.5-Coder (Локально)');
            }}
            className={`px-2.5 py-1 rounded-md font-medium transition-all ${
              activeModel === 'qwen' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-600'
            }`}
          >
            Qwen2.5-Coder (Local)
          </button>
          <button
            onClick={() => {
              setActiveModel('vision');
              showToast('Модель: Ollama · Llama 3.2-Vision (OCR-multimodal)');
            }}
            className={`px-2.5 py-1 rounded-md font-medium transition-all ${
              activeModel === 'vision' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-600'
            }`}
          >
            Llama 3.2-Vision
          </button>
          <button
            onClick={() => {
              setActiveModel('claude');
              showToast('Модель: Claude 3.5 Sonnet / Gemini API');
            }}
            className={`px-2.5 py-1 rounded-md font-medium transition-all ${
              activeModel === 'claude' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-600'
            }`}
          >
            Gemini / Claude API
          </button>
        </div>
      </div>

      {/* Main Split Body */}
      <div className="flex-1 flex flex-col lg:flex-row bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden min-h-[560px]">
        {/* Left History Drawer (collapsible) */}
        {isHistoryOpen && (
          <div className="w-full lg:w-64 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col p-3 animate-in slide-in-from-left duration-150 shrink-0">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">История диалогов</span>
              <button onClick={() => setIsHistoryOpen(false)} className="text-slate-400 hover:text-slate-600 text-xs">✕</button>
            </div>
            <div className="space-y-1 overflow-y-auto flex-1 text-xs">
              <div className="p-2.5 bg-teal-50 text-[#006763] rounded-lg border border-teal-200 font-medium cursor-pointer">
                Обработка медицинских документов
                <span className="block text-[10px] text-slate-400 mt-0.5">Сегодня • 3 сообщения</span>
              </div>
              <div className="p-2.5 text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer">
                Проверка договора найма № 42
                <span className="block text-[10px] text-slate-400 mt-0.5">Вчера • Завершено</span>
              </div>
              <div className="p-2.5 text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer">
                Сравнение анализов Инвитро
                <span className="block text-[10px] text-slate-400 mt-0.5">14 окт • 6 параметров</span>
              </div>
            </div>
          </div>
        )}

        {/* Center Conversation */}
        <div className="flex-1 min-w-0 flex flex-col bg-slate-50/50 overflow-hidden">
          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            <div className="w-full max-w-3xl xl:max-w-4xl 2xl:max-w-5xl mx-auto space-y-4">
              {messages.map(msg => (
                <div 
                  key={msg.id}
                  className={`flex gap-3 ${
                    msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-xs text-xs font-bold ${
                    msg.sender === 'user' 
                      ? 'bg-[#006763] text-white' 
                      : 'bg-teal-100 text-[#006763] border border-teal-200'
                  }`}>
                    {msg.sender === 'user' ? 'Я' : <Bot className="w-4 h-4" />}
                  </div>

                <div className="space-y-2 max-w-xl text-xs">
                  <div className={`p-4 rounded-2xl shadow-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#006763] text-white rounded-tr-none'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>

                  {msg.structuredCard && (
                    <div className="bg-white p-4 rounded-xl border border-teal-200 shadow-xs space-y-3">
                      <div className="flex items-center gap-1.5 font-semibold text-[#006763] text-xs">
                        <FileCheck className="w-4 h-4" />
                        {msg.structuredCard.title}
                      </div>

                      <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                        {msg.structuredCard.fields.map((f, i) => (
                          <div key={i} className="flex justify-between items-center text-[11px]">
                            <span className="text-slate-500">{f.label}:</span>
                            <span className="font-mono font-medium text-slate-800 flex items-center gap-1">
                              {f.value}
                              {f.verified && <Check className="w-3 h-3 text-emerald-600" />}
                            </span>
                          </div>
                        ))}
                      </div>

                      {msg.structuredCard.actionLabel && msg.structuredCard.targetScreen && (
                        <button
                          onClick={() => {
                            if (msg.structuredCard?.targetScreen) {
                              setCurrentScreen(msg.structuredCard.targetScreen as any);
                            }
                          }}
                          className="w-full py-1.5 bg-teal-50 hover:bg-teal-100 text-[#006763] border border-teal-200 rounded-md font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
                        >
                          {msg.structuredCard.actionLabel}
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}

                  <span className={`text-[10px] text-slate-400 block px-1 ${
                    msg.sender === 'user' ? 'text-right' : 'text-left'
                  }`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}
            </div>
          </div>

          {/* Quick Suggestions & Input Composer */}
          <div className="bg-white border-t border-slate-200 p-4">
            <div className="w-full max-w-3xl xl:max-w-4xl 2xl:max-w-5xl mx-auto space-y-3">
              {/* Chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInputText(prompt);
                    }}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-teal-50 hover:text-[#006763] border border-slate-200 rounded-full text-slate-600 whitespace-nowrap text-[11px] transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <input 
                  type="text"
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  placeholder="Задайте вопрос или команду по документам архива..."
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#006763]"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="px-4 py-2.5 bg-[#006763] hover:bg-[#00524f] text-white rounded-xl text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  Отправить
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Right Inspector Panel */}
        {isInspectorOpen && (
          <div className="w-full lg:w-72 xl:w-80 shrink-0 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 p-4 flex flex-col justify-between text-xs space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 font-semibold text-slate-800">
                <span>Инспектор контекста</span>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Zero Data Leak
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[11px] text-slate-400 block">Активная модель:</span>
                <p className="font-semibold text-slate-800">Ollama Qwen2.5-Coder 14B</p>
                <div className="flex justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                  <span>Контекст токенов:</span>
                  <span className="font-mono">1 240 / 32 768</span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Доступные источники
                </span>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-teal-600" />
                    <span>Открытый архив (Open)</span>
                  </div>
                  <span className="font-mono text-slate-500">42 док.</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                    <span>Реестр «Мои данные»</span>
                  </div>
                  <span className="font-mono text-slate-500">8 рекв.</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-[11px] text-teal-900 leading-relaxed">
              Локальный ассистент не осуществляет сетевых вызовов при обработке документов зоны Secret. 
              Все векторные эмбеддинги генерируются локально.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
