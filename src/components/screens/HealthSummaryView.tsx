import React, { useState } from 'react';
import { useVault } from '../../context/VaultContext';
import { 
  HeartPulse, 
  Activity, 
  Pill, 
  Syringe, 
  FileText, 
  TrendingUp, 
  Calendar, 
  Download, 
  Printer, 
  Search, 
  Languages, 
  AlertCircle, 
  ShieldCheck, 
  Lock, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  ExternalLink,
  Flame,
  Moon,
  Sparkles
} from 'lucide-react';

export const HealthSummaryView: React.FC = () => {
  const { isVeraCryptMounted, setCurrentScreen, setActiveDocId, showToast } = useVault();

  const [activeTab, setActiveTab] = useState<'overview' | 'conditions' | 'labs' | 'medications' | 'vaccines' | 'fitness' | 'summary'>('overview');
  const [lang, setLang] = useState<'RU' | 'EN' | 'FR'>('RU');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLabTrend, setSelectedLabTrend] = useState<string>('ferritin');

  // Medical data
  const conditions = [
    {
      id: 'c1',
      title: lang === 'EN' ? 'Arterial Hypertension Stage II' : lang === 'FR' ? 'Hypertension Artérielle Stade II' : 'Артериальная гипертензия II стадии, риск 2',
      status: 'Контролируемая',
      date: '2026-09-12',
      doctor: 'Д-р Васильев А.С., Кардиолог',
      notes: 'Целевое АД достигнуто (<130/80 мм рт. ст.). Текущая монотерапия.',
      zone: 'open'
    },
    {
      id: 'c2',
      title: lang === 'EN' ? 'Cervical Osteochondrosis' : lang === 'FR' ? 'Ostéochondrose Cervicale' : 'Остеохондроз шейно-грудного отдела позвоночника',
      status: 'Ремиссия',
      date: '2025-11-20',
      doctor: 'Д-р Маркова Е.В., Невролог',
      notes: 'Рекомендован курс ЛФК и плавание 2 раза в неделю.',
      zone: 'open'
    },
    {
      id: 'c3',
      title: lang === 'EN' ? 'Chronic Superficial Gastritis' : lang === 'FR' ? 'Gastrite Chronique Superficielle' : 'Хронический поверхностный гастрит (Secret)',
      status: 'Компенсирован',
      date: '2026-02-14',
      doctor: 'Д-р Морозов К.И., Гастроэнтеролог',
      notes: 'Helicobacter pylori отрицательный. Диета стол №1.',
      zone: 'secret'
    }
  ];

  const labs = [
    {
      id: 'ferritin',
      name: lang === 'EN' ? 'Serum Ferritin' : lang === 'FR' ? 'Ferritine Sérique' : 'Ферритин сыворотки',
      unit: 'мкг/л',
      norm: '30 — 150',
      current: '68.4',
      status: 'normal',
      trend: [
        { date: '2024-10', val: 24.1 },
        { date: '2025-04', val: 38.5 },
        { date: '2025-11', val: 52.0 },
        { date: '2026-09', val: 68.4 }
      ]
    },
    {
      id: 'hemoglobin',
      name: lang === 'EN' ? 'Hemoglobin (Hb)' : lang === 'FR' ? 'Hémoglobine' : 'Гемоглобин',
      unit: 'г/л',
      norm: '130 — 160',
      current: '148',
      status: 'normal',
      trend: [
        { date: '2024-10', val: 132 },
        { date: '2025-04', val: 140 },
        { date: '2025-11', val: 144 },
        { date: '2026-09', val: 148 }
      ]
    },
    {
      id: 'tsh',
      name: lang === 'EN' ? 'Thyroid Stimulating Hormone (TSH)' : lang === 'FR' ? 'Thyréostimuline (TSH)' : 'ТТГ (Тиреотропный гормон)',
      unit: 'мЕд/л',
      norm: '0.4 — 4.0',
      current: '2.14',
      status: 'normal',
      trend: [
        { date: '2024-10', val: 2.8 },
        { date: '2025-04', val: 2.4 },
        { date: '2025-11', val: 2.2 },
        { date: '2026-09', val: 2.14 }
      ]
    },
    {
      id: 'cholesterol',
      name: lang === 'EN' ? 'Total Cholesterol' : lang === 'FR' ? 'Cholestérol Total' : 'Холестерин общий',
      unit: 'ммоль/л',
      norm: '3.5 — 5.2',
      current: '4.82',
      status: 'normal',
      trend: [
        { date: '2024-10', val: 5.4 },
        { date: '2025-04', val: 5.1 },
        { date: '2025-11', val: 4.95 },
        { date: '2026-09', val: 4.82 }
      ]
    }
  ];

  const medications = [
    {
      name: 'Периндоприл (Perindopril)',
      dose: '4 мг',
      freq: '1 раз в сутки, утром',
      purpose: 'Контроль артериального давления',
      since: '2026-09-15'
    },
    {
      name: 'Колекальциферол (Витамин D3)',
      dose: '2000 МЕ',
      freq: '1 раз в сутки во время еды',
      purpose: 'Профилактическая саплементация',
      since: '2025-10-01'
    },
    {
      name: 'Омепразол (Omeprazole)',
      dose: '20 мг',
      freq: 'По требованию при диспепсии',
      purpose: 'Защита слизистой ЖКТ',
      since: '2026-02-14'
    }
  ];

  const vaccines = [
    { title: 'АДС-М (Дифтерия, Столбняк)', date: '2021-05-18', nextDate: '2031-05', status: 'valid' },
    { title: 'Грипп (Ультрикс Квадри)', date: '2026-09-28', nextDate: '2027-09', status: 'valid' },
    { title: 'Гепатит B (Рекомбинантная)', date: '2019-11-04', nextDate: 'Бессрочно', status: 'valid' },
    { title: 'Клещевой энцефалит (ЭнцеВир)', date: '2024-03-12', nextDate: '2027-03', status: 'valid' }
  ];

  const visibleConditions = conditions.filter(c => c.zone !== 'secret' || isVeraCryptMounted);

  const activeTrendData = labs.find(l => l.id === selectedLabTrend) || labs[0];

  const handlePrintSummary = () => {
    showToast('Сформирован PDF медицинского паспорта для печати (A4 Résumé)');
    window.print?.();
  };

  return (
    <div className="flex-1 flex flex-col bg-[#f4faff] h-full overflow-hidden">
      {/* Top Banner */}
      <div className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-rose-600" />
              SCR-19: Сводка здоровья (Health Summary)
            </h1>
            <span className="px-2 py-0.5 rounded text-xs font-mono bg-teal-50 text-[#006763] border border-teal-200">
              v2.4-clinical
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Агрегированная медицинская карта, лабораторные тренды и международный паспорт пациента.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-md border border-slate-200 text-xs font-medium">
            {(['RU', 'EN', 'FR'] as const).map(l => (
              <button
                key={l}
                onClick={() => {
                  setLang(l);
                  showToast(`Язык медицинской выписки изменен: ${l}`);
                }}
                className={`px-2.5 py-1 rounded transition-all ${
                  lang === l ? 'bg-[#006763] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          <button
            onClick={() => setActiveTab('summary')}
            className="px-3.5 py-1.5 bg-[#006763] hover:bg-[#00524f] text-white rounded-md text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Экспорт резюме (A4)
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="bg-white border-b border-slate-200 px-6 flex items-center gap-2 overflow-x-auto text-xs">
        {[
          { id: 'overview', label: 'Обзор', icon: Activity },
          { id: 'conditions', label: `Диагнозы (${visibleConditions.length})`, icon: HeartPulse },
          { id: 'labs', label: 'Анализы и тренды', icon: TrendingUp },
          { id: 'medications', label: `Лекарства (${medications.length})`, icon: Pill },
          { id: 'vaccines', label: `Прививки (${vaccines.length})`, icon: Syringe },
          { id: 'fitness', label: 'Активность и пульс', icon: Moon },
          { id: 'summary', label: 'Международный паспорт (A4)', icon: FileText }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-3 border-b-2 font-medium flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                isActive 
                  ? 'border-[#006763] text-[#006763]' 
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6 max-w-6xl mx-auto">
            {/* Quick KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-xs text-slate-500 block mb-1">Артериальное давление</span>
                <div className="text-2xl font-bold font-mono text-slate-800">122 / 78</div>
                <span className="text-[11px] text-emerald-600 font-medium">В пределах целевого диапазона</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-xs text-slate-500 block mb-1">Ферритин (Запас железа)</span>
                <div className="text-2xl font-bold font-mono text-teal-700">68.4 мкг/л</div>
                <span className="text-[11px] text-slate-500 font-mono">Тренд: +44.3 за 2 года</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-xs text-slate-500 block mb-1">Постоянная терапия</span>
                <div className="text-2xl font-bold font-mono text-slate-800">1 препарат</div>
                <span className="text-[11px] text-slate-500">Периндоприл 4 мг</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-xs text-slate-500 block mb-1">Плановый чекап</span>
                <div className="text-base font-bold text-slate-800 mt-1">Ноябрь 2026</div>
                <span className="text-[11px] text-amber-600 font-medium">Срок через 20 дней</span>
              </div>
            </div>

            {/* Split Clinical Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: Active Conditions */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                    <HeartPulse className="w-4 h-4 text-rose-600" />
                    Клинические диагнозы
                  </span>
                  <button 
                    onClick={() => setActiveTab('conditions')}
                    className="text-xs text-[#006763] hover:underline"
                  >
                    Все диагнозы →
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  {visibleConditions.map(c => (
                    <div key={c.id} className="p-3 bg-slate-50/80 rounded-lg border border-slate-200/80">
                      <div className="flex items-center justify-between font-semibold text-slate-800 mb-1">
                        <span>{c.title}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {c.status}
                        </span>
                      </div>
                      <p className="text-slate-500 text-[11px] mb-1">{c.notes}</p>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <span>{c.doctor}</span>
                        <span>{c.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Lab Trend Snapshot */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#006763]" />
                    Лабораторные маркеры
                  </span>
                  <button 
                    onClick={() => setActiveTab('labs')}
                    className="text-xs text-[#006763] hover:underline"
                  >
                    Все анализы →
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  {labs.map(lab => (
                    <div 
                      key={lab.id} 
                      onClick={() => {
                        setSelectedLabTrend(lab.id);
                        setActiveTab('labs');
                      }}
                      className="p-3 bg-slate-50 hover:bg-teal-50/50 rounded-lg border border-slate-200/80 cursor-pointer transition-colors flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium text-slate-800">{lab.name}</p>
                        <p className="text-[11px] text-slate-400 font-mono">Норма: {lab.norm} {lab.unit}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-bold font-mono text-teal-800">
                          {lab.current}
                        </span>
                        <span className="text-[11px] text-slate-500 ml-1">{lab.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Conditions */}
        {activeTab === 'conditions' && (
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-base font-semibold text-slate-800">Перечень установленных диагнозов</h2>
              <div className="space-y-3">
                {visibleConditions.map(c => (
                  <div key={c.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-sm">{c.title}</span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        {c.status}
                      </span>
                    </div>
                    <p className="text-slate-600 text-xs leading-relaxed">{c.notes}</p>
                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-slate-400 font-mono text-[11px]">
                      <span>{c.doctor}</span>
                      <span>Дата установления: {c.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Labs & Dynamic Graph */}
        {activeTab === 'labs' && (
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Lab List */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                  Показатели
                </span>
                {labs.map(lab => (
                  <button
                    key={lab.id}
                    onClick={() => setSelectedLabTrend(lab.id)}
                    className={`w-full p-3.5 rounded-xl border text-left transition-all text-xs ${
                      selectedLabTrend === lab.id
                        ? 'bg-teal-50 border-teal-300 shadow-xs text-[#006763] font-semibold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span>{lab.name}</span>
                      <span className="font-mono text-sm">{lab.current}</span>
                    </div>
                    <span className="text-[11px] opacity-75 font-mono">{lab.unit}</span>
                  </button>
                ))}
              </div>

              {/* Lab Trend Chart */}
              <div className="md:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-semibold text-slate-800">{activeTrendData.name}</h3>
                    <p className="text-xs text-slate-400 font-mono">
                      Референсный интервал: {activeTrendData.norm} {activeTrendData.unit}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-medium">
                    Норма (Нормокинез)
                  </span>
                </div>

                {/* SVG Visual Graph */}
                <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/80">
                  <div className="text-[11px] text-slate-400 mb-2 flex justify-between font-mono">
                    <span>Динамика по датам (2024 — 2026)</span>
                    <span>Ед.: {activeTrendData.unit}</span>
                  </div>

                  <div className="h-44 flex items-end justify-between px-6 pt-6 pb-2 gap-4">
                    {activeTrendData.trend.map((point, idx) => {
                      const maxVal = Math.max(...activeTrendData.trend.map(p => p.val)) * 1.25;
                      const heightPercent = Math.min(100, Math.max(15, (point.val / maxVal) * 100));

                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                          <span className="text-xs font-mono font-bold text-teal-800">
                            {point.val}
                          </span>
                          <div 
                            style={{ height: `${heightPercent}%` }}
                            className="w-12 bg-linear-to-t from-[#006763] to-teal-400 rounded-t-md transition-all shadow-xs"
                          />
                          <span className="text-[10px] font-mono text-slate-500 whitespace-nowrap">
                            {point.date}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="p-3 bg-teal-50/60 rounded-lg border border-teal-200 text-xs text-teal-900 leading-relaxed">
                  <strong>Заключение врача:</strong> Положительная динамика показателя, целевой уровень достигнут без признаков дефицита или перегрузки.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Medications */}
        {activeTab === 'medications' && (
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-base font-semibold text-slate-800">Текущий лист назначений</h2>
              <div className="divide-y divide-slate-100 text-xs">
                {medications.map((med, idx) => (
                  <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-800 text-sm mb-1">{med.name}</h4>
                      <p className="text-slate-600 mb-1"><strong>Режим приема:</strong> {med.freq} (доза: {med.dose})</p>
                      <p className="text-slate-500 text-[11px]">Назначение: {med.purpose}</p>
                    </div>
                    <span className="font-mono text-slate-400 text-[11px]">С {med.since}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Vaccines */}
        {activeTab === 'vaccines' && (
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-base font-semibold text-slate-800">Прививочный сертификат (Вакцинация)</h2>
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                    <th className="py-2.5 px-3">Вакцина / Инфекция</th>
                    <th className="py-2.5 px-3">Дата последней дозы</th>
                    <th className="py-2.5 px-3">Срок ревакцинации</th>
                    <th className="py-2.5 px-3 text-right">Статус</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vaccines.map((v, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60">
                      <td className="py-3 px-3 font-medium text-slate-800">{v.title}</td>
                      <td className="py-3 px-3 font-mono text-slate-600">{v.date}</td>
                      <td className="py-3 px-3 font-mono text-slate-600">{v.nextDate}</td>
                      <td className="py-3 px-3 text-right">
                        <span className="px-2 py-0.5 rounded-full text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                          Актуальна
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 6: Fitness & Sleep */}
        {activeTab === 'fitness' && (
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs">
              <h2 className="text-base font-semibold text-slate-800">Показатели активности и сна (Wearable Monitor)</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block mb-1">Средний пульс в покое</span>
                  <div className="text-2xl font-bold font-mono text-slate-800">58 уд/мин</div>
                  <span className="text-[11px] text-emerald-600">Брадикардия покоя (норма для тренированных)</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block mb-1">Шаги в день (среднее)</span>
                  <div className="text-2xl font-bold font-mono text-teal-800">9 420</div>
                  <span className="text-[11px] text-slate-500">Цель 10 000 (94%)</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block mb-1">Продолжительность сна</span>
                  <div className="text-2xl font-bold font-mono text-indigo-700">7 ч 42 мин</div>
                  <span className="text-[11px] text-slate-500">Глубокий сон: 1 ч 45 мин</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 7: Printable Medical Summary A4 */}
        {activeTab === 'summary' && (
          <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl border border-slate-300 shadow-lg space-y-6 text-xs text-slate-800">
            {/* Header Document */}
            <div className="border-b-2 border-slate-800 pb-4 flex justify-between items-start">
              <div>
                <h2 className="text-lg font-bold uppercase tracking-wider text-slate-900">
                  {lang === 'EN' ? 'Medical Emergency Summary & Health Dossier' : lang === 'FR' ? 'Résumé Médical d\'Urgence' : 'Медицинский паспорт и краткая выписка'}
                </h2>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  PersonalVault 2.0 • ID: PV2-MED-2026-RU • Form A4-Standard
                </p>
              </div>
              <button 
                onClick={handlePrintSummary}
                className="px-3 py-1.5 bg-[#006763] hover:bg-[#00524f] text-white rounded font-medium flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> Печать A4
              </button>
            </div>

            {/* Patient Info */}
            <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <span className="text-[11px] text-slate-400 block">ФИО / Patient:</span>
                <span className="font-bold text-slate-800">Иванов Иван Сергеевич (Ivanov Ivan)</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Группа крови / Blood Type:</span>
                <span className="font-bold text-rose-700">A (II) Rh+ (Положительный)</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Аллергии / Drug Allergies:</span>
                <span className="font-semibold text-slate-700">Не зафиксированы (NKDA)</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Контактное лицо / ICE:</span>
                <span className="font-semibold text-slate-700">+7 (999) 000-11-22 (Супруга)</span>
              </div>
            </div>

            {/* Diagnosis Section */}
            <div>
              <h4 className="font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-1 mb-2">
                1. Активные диагнозы (Current Conditions)
              </h4>
              <ul className="list-disc list-inside space-y-1">
                {visibleConditions.map(c => (
                  <li key={c.id}>
                    <strong>{c.title}</strong> — {c.status} ({c.notes})
                  </li>
                ))}
              </ul>
            </div>

            {/* Current Meds */}
            <div>
              <h4 className="font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-1 mb-2">
                2. Регулярная фармакотерапия (Current Medications)
              </h4>
              <ul className="list-disc list-inside space-y-1">
                {medications.map((m, i) => (
                  <li key={i}>
                    <strong>{m.name}</strong>, доза: {m.dose}, режим: {m.freq}
                  </li>
                ))}
              </ul>
            </div>

            {/* Sign and seal */}
            <div className="pt-6 border-t border-slate-200 flex justify-between items-end text-[11px] text-slate-400">
              <span>Сформировано автоматически из верифицированного архива PersonalVault 2.0</span>
              <span className="font-mono">Дата: 25.10.2026 09:30 UTC</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
