/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useVault } from '../../context/VaultContext';
import { 
  HeartPulse, 
  Activity, 
  Pill, 
  Syringe, 
  FileText, 
  TrendingUp, 
  Printer, 
  Search, 
  Lock, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  Watch, 
  Upload, 
  AlertTriangle, 
  X, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  ArrowLeft, 
  FileCheck, 
  FileSpreadsheet, 
  Stethoscope, 
  Eye, 
  Check 
} from 'lucide-react';

export const HealthSummaryView: React.FC = () => {
  const { 
    isVeraCryptMounted, 
    toggleVeraCrypt, 
    setCurrentScreen, 
    setActiveDocId, 
    showToast, 
    activeScenario 
  } = useVault();

  // Tab Navigation: 8 tabs as required
  const [activeTab, setActiveTab] = useState<
    'overview' | 'conditions' | 'labs' | 'medications' | 'vaccines' | 'fitness' | 'history' | 'summary'
  >('overview');

  // Controls & Filters
  const [lang, setLang] = useState<'RU' | 'EN' | 'FR'>('RU');
  const [reportLang, setReportLang] = useState<'RU' | 'EN' | 'FR'>('FR');
  const [searchQuery, setSearchQuery] = useState('');
  const [securityFilterMode, setSecurityFilterMode] = useState<'ALL' | 'OPEN_ONLY'>('ALL');
  const [isSecurityDropdownOpen, setIsSecurityDropdownOpen] = useState(false);
  const [showSecretDisconnectedBanner, setShowSecretDisconnectedBanner] = useState(false);

  // Sub-views & Inspect Drawers
  const [selectedConditionDetail, setSelectedConditionDetail] = useState<string | null>(null);
  const [selectedLabTest, setSelectedLabTest] = useState<string>('ferritin');
  const [bpTimeframe, setBpTimeframe] = useState<'30' | '90' | '365'>('30');
  const [chartPointInfo, setChartPointInfo] = useState<string>('Посл. замер: 124 / 78 мм рт. ст. (В норме)');
  const [trackerDateOffset, setTrackerDateOffset] = useState<number>(0);

  // Filters within tabs
  const [conditionStatusFilter, setConditionStatusFilter] = useState<'all' | 'active' | 'anamnesis' | 'review'>('all');
  const [labCategoryFilter, setLabCategoryFilter] = useState<'all' | 'biochem' | 'blood' | 'hormones'>('all');
  const [historyFilter, setHistoryFilter] = useState<'all' | 'consult' | 'labs' | 'prescriptions'>('all');

  // Modals & Panels
  const [docPreviewKey, setDocPreviewKey] = useState<string | null>(null);
  const [verificationModalType, setVerificationModalType] = useState<'magne' | 'ferritin' | null>(null);
  const [verificationAction, setVerificationAction] = useState<'add' | 'anamnesis' | 'reject'>('add');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importHasError, setImportHasError] = useState(false);
  const [importFileName, setImportFileName] = useState('apple_health_export_2026.csv (14.2 МБ)');

  // Dynamic state toggles for simulation/real user workflows
  const [hasHealthData, setHasHealthData] = useState(true);
  const [hasBraceletData, setHasBraceletData] = useState(true);
  const [dismissedPendingIds, setDismissedPendingIds] = useState<Set<string>>(new Set());
  const [includeSecretInReport, setIncludeSecretInReport] = useState(true);
  const [includeQRInReport, setIncludeQRInReport] = useState(true);
  const [reportType, setReportType] = useState<'emergency' | 'brief' | 'full'>('emergency');

  // React to VeraCrypt lock or scenario updates
  const isSecretEffectiveLocked = !isVeraCryptMounted || securityFilterMode === 'OPEN_ONLY';

  useEffect(() => {
    if (!isVeraCryptMounted) {
      setShowSecretDisconnectedBanner(true);
    }
  }, [isVeraCryptMounted]);

  // Synchronize with activeScenario if triggered from top developer ribbon
  useEffect(() => {
    if (!activeScenario || activeScenario === 'normal') {
      setSecurityFilterMode('OPEN_ONLY');
      setHasHealthData(true);
      setHasBraceletData(true);
      return;
    }

    if (activeScenario === 'open_secret') {
      setSecurityFilterMode('ALL');
      setHasHealthData(true);
      setHasBraceletData(true);
      setActiveTab('overview');
    } else if (activeScenario === 'secret_locked') {
      setSecurityFilterMode('OPEN_ONLY');
      setShowSecretDisconnectedBanner(true);
      setActiveTab('overview');
    } else if (activeScenario === 'empty') {
      setHasHealthData(false);
      setActiveTab('overview');
    } else if (activeScenario === 'verification') {
      setActiveTab('overview');
      setVerificationModalType('magne');
    } else if (activeScenario === 'disease_detail') {
      setActiveTab('conditions');
      setSelectedConditionDetail('hypertension');
    } else if (activeScenario === 'labs_trend') {
      setActiveTab('labs');
      setSelectedLabTest('ferritin');
    } else if (activeScenario === 'fitness') {
      setActiveTab('fitness');
      setHasBraceletData(true);
    } else if (activeScenario === 'no_tracker') {
      setActiveTab('fitness');
      setHasBraceletData(false);
      setIsImportModalOpen(true);
    } else if (activeScenario === 'import_error') {
      setActiveTab('fitness');
      setIsImportModalOpen(true);
      setImportHasError(true);
    } else if (activeScenario === 'summary_fr') {
      setActiveTab('summary');
      setReportLang('FR');
    } else if (activeScenario === 'missing_source') {
      setActiveTab('conditions');
      setSelectedConditionDetail('hypertension');
      setDocPreviewKey('missing_file');
    } else if (activeScenario === 'secret_disconnect') {
      setActiveTab('conditions');
      setSecurityFilterMode('OPEN_ONLY');
      setShowSecretDisconnectedBanner(true);
    }
  }, [activeScenario]);

  // Data sets
  const conditions = useMemo(() => [
    {
      id: 'hypertension',
      code: 'I11.9',
      title: lang === 'EN' 
        ? 'Hypertension Stage II, Risk 2' 
        : lang === 'FR' 
        ? 'Hypertension artérielle essentielle Stade II' 
        : 'Гипертоническая болезнь II стадии, риск 2',
      status: 'active' as const,
      statusLabel: 'Активно',
      manifestDate: '14.05.2021',
      lastVisitDate: '12.09.2026',
      notes: 'Целевое АД: <130/80 мм рт. ст. Регулярная терапия. Достигнуто целевое АД на монотерапии.',
      doctor: 'ГКБ №1, к.м.н. Смирнова Е.А.',
      docsCount: 6,
      zone: 'open' as const,
    },
    {
      id: 'rhinitis',
      code: 'J30.1',
      title: lang === 'EN' 
        ? 'Allergic Rhinitis (Seasonal pollen)' 
        : lang === 'FR' 
        ? 'Rhinite allergique saisonnière' 
        : 'Аллергический ринит (пыльцевой, сезонный)',
      status: 'anamnesis' as const,
      statusLabel: 'В анамнезе',
      manifestDate: '03.04.2018',
      lastVisitDate: '20.05.2025',
      notes: 'Берёза, злаковые. Период обострения: май-июнь. Рекомендован Супрастинекс по требованию.',
      doctor: 'Поликлиника №4, Аллерголог Григорьева М.А.',
      docsCount: 2,
      zone: 'open' as const,
    },
    {
      id: 'ferritin_deficiency',
      code: 'E61.1',
      title: lang === 'EN' 
        ? 'Latent Iron Deficiency' 
        : lang === 'FR' 
        ? 'Carence martiale latente' 
        : 'Дефицит железа латентный',
      status: 'review' as const,
      statusLabel: 'На проверке',
      manifestDate: '14.10.2026',
      lastVisitDate: '14.10.2026',
      notes: 'Обнаружен по анализу биохимии от 14.10.2026 (Ферритин 18 мкг/л). Требуется подтверждение врача.',
      doctor: 'Лаборатория Инвитро (Автовыгрузка)',
      docsCount: 1,
      zone: 'open' as const,
    },
    {
      id: 'gastroduodenitis',
      code: 'K29.5',
      title: lang === 'EN' 
        ? 'Chronic Gastroduodenitis (Remission)' 
        : lang === 'FR' 
        ? 'Gastroduodénite chronique (Rémission)' 
        : 'Гастродуоденит хронический, ст. ремиссии',
      status: 'anamnesis' as const,
      statusLabel: 'В анамнезе',
      manifestDate: '11.02.2024',
      lastVisitDate: '11.02.2024',
      notes: 'ФГДС от 11.02.2024. H. pylori отрицательный. Диета стол №1 в период обострений.',
      doctor: 'КДЦ Гастроэнтерологии, Морозов К.И.',
      docsCount: 1,
      zone: 'secret' as const,
    }
  ], [lang]);

  // Filter conditions
  const visibleConditions = useMemo(() => {
    return conditions.filter(c => {
      if (c.zone === 'secret' && isSecretEffectiveLocked) return false;
      if (conditionStatusFilter === 'active' && c.status !== 'active') return false;
      if (conditionStatusFilter === 'anamnesis' && c.status !== 'anamnesis') return false;
      if (conditionStatusFilter === 'review' && c.status !== 'review') return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return c.title.toLowerCase().includes(q) || 
               c.code.toLowerCase().includes(q) || 
               c.notes.toLowerCase().includes(q) ||
               c.doctor.toLowerCase().includes(q);
      }
      return true;
    });
  }, [conditions, isSecretEffectiveLocked, conditionStatusFilter, searchQuery]);

  // Lab Tests
  const labs = useMemo(() => [
    {
      id: 'ferritin',
      name: lang === 'EN' ? 'Serum Ferritin' : lang === 'FR' ? 'Ferritine Sérique' : 'Ферритин',
      category: 'biochem',
      source: 'Инвитро · Венозная кровь',
      val: '18',
      unit: 'мкг/л',
      norm: '20.0 — 250.0',
      date: '14.10.2026',
      status: 'low',
      statusLabel: 'Ниже нормы',
      fileName: 'INVITRO_14102026_8831.pdf',
      sha: '4a8c9e...1b02',
      trend: [
        { date: '12.11.24', val: 45 },
        { date: '20.05.25', val: 32 },
        { date: '14.10.26', val: 18 }
      ],
      interpretation: 'Снижение уровня ферритина свидетельствует об истощении запасов железа в депо. Рекомендована консультация терапевта.',
      zone: 'open'
    },
    {
      id: 'hemoglobin',
      name: lang === 'EN' ? 'Hemoglobin (Hb)' : lang === 'FR' ? 'Hémoglobine' : 'Гемоглобин (Hb)',
      category: 'blood',
      source: 'Инвитро · ОАК',
      val: '138',
      unit: 'г/л',
      norm: '130.0 — 160.0',
      date: '14.10.2026',
      status: 'normal',
      statusLabel: 'Норма',
      fileName: 'INVITRO_14102026_8831.pdf',
      sha: '4a8c9e...1b02',
      trend: [
        { date: '12.11.24', val: 132 },
        { date: '20.05.25', val: 135 },
        { date: '14.10.26', val: 138 }
      ],
      interpretation: 'Концентрация гемоглобина в пределах физиологической нормы для мужчин. Признаков явной анемии нет.',
      zone: 'open'
    },
    {
      id: 'cholesterol',
      name: lang === 'EN' ? 'Total Cholesterol' : lang === 'FR' ? 'Cholestérol Total' : 'Холестерин общий',
      category: 'biochem',
      source: 'Хеликс · Липидный профиль',
      val: '4.82',
      unit: 'ммоль/л',
      norm: '3.50 — 5.20',
      date: '14.10.2026',
      status: 'normal',
      statusLabel: 'Норма',
      fileName: 'HELIX_LIPID_2026.pdf',
      sha: 'b819fa...3310',
      trend: [
        { date: '12.11.24', val: 5.4 },
        { date: '20.05.25', val: 5.1 },
        { date: '14.10.26', val: 4.82 }
      ],
      interpretation: 'Уровень общего холестерина снизился до оптимального коридора на фоне средиземноморской диеты.',
      zone: 'open'
    },
    {
      id: 'ldl',
      name: lang === 'EN' ? 'LDL Cholesterol' : lang === 'FR' ? 'Cholestérol LDL' : 'Холестерин ЛПНП',
      category: 'biochem',
      source: 'Хеликс · Липидограмма',
      val: '2.41',
      unit: 'ммоль/л',
      norm: '< 3.00',
      date: '14.10.2026',
      status: 'normal',
      statusLabel: 'Норма',
      fileName: 'HELIX_LIPID_2026.pdf',
      sha: 'b819fa...3310',
      trend: [
        { date: '12.11.24', val: 2.9 },
        { date: '20.05.25', val: 2.65 },
        { date: '14.10.26', val: 2.41 }
      ],
      interpretation: 'Атерогенные фракции липопротеинов низкой плотности в пределах целевых значений.',
      zone: 'open'
    },
    {
      id: 'glucose',
      name: lang === 'EN' ? 'Fasting Plasma Glucose' : lang === 'FR' ? 'Glycémie à jeun' : 'Глюкоза плазмы натощак',
      category: 'biochem',
      source: 'Инвитро · Биохимия',
      val: '5.1',
      unit: 'ммоль/л',
      norm: '4.1 — 5.9',
      date: '14.10.2026',
      status: 'normal',
      statusLabel: 'Норма',
      fileName: 'INVITRO_14102026_8831.pdf',
      sha: '4a8c9e...1b02',
      trend: [
        { date: '12.11.24', val: 4.9 },
        { date: '20.05.25', val: 5.2 },
        { date: '14.10.26', val: 5.1 }
      ],
      interpretation: 'Углеводный обмен стабилен, нарушений толерантности к глюкозе не выявлено.',
      zone: 'open'
    },
    {
      id: 'tsh',
      name: lang === 'EN' ? 'TSH (Thyrotropin)' : lang === 'FR' ? 'Thyréostimuline (TSH)' : 'ТТГ (Тиреотропный гормон)',
      category: 'hormones',
      source: 'Гемотест · Гормональный статус',
      val: '2.14',
      unit: 'мЕд/л',
      norm: '0.40 — 4.00',
      date: '15.04.2026',
      status: 'normal',
      statusLabel: 'Норма',
      fileName: 'GEMOTEST_TSH_SECRET.pdf',
      sha: 'ff9012...88a1',
      trend: [
        { date: '10.04.24', val: 2.8 },
        { date: '15.04.25', val: 2.4 },
        { date: '15.04.26', val: 2.14 }
      ],
      interpretation: 'Функция щитовидной железы сохранена (эутиреоз).',
      zone: 'secret'
    }
  ], [lang]);

  const visibleLabs = useMemo(() => {
    return labs.filter(l => {
      if (l.zone === 'secret' && isSecretEffectiveLocked) return false;
      if (labCategoryFilter !== 'all' && l.category !== labCategoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return l.name.toLowerCase().includes(q) || l.source.toLowerCase().includes(q);
      }
      return true;
    });
  }, [labs, isSecretEffectiveLocked, labCategoryFilter, searchQuery]);

  const activeLabData = useMemo(() => {
    return visibleLabs.find(l => l.id === selectedLabTest) || visibleLabs[0] || labs[0];
  }, [visibleLabs, selectedLabTest, labs]);

  // Handle Search Input Jump or Filter
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    const q = val.toLowerCase();
    if (q.includes('гипер') || q.includes('давлен') || q.includes('аг')) {
      setActiveTab('conditions');
    } else if (q.includes('ферр') || q.includes('холест') || q.includes('кров') || q.includes('анализ')) {
      setActiveTab('labs');
    } else if (q.includes('перинд') || q.includes('магне') || q.includes('таблет') || q.includes('лекар')) {
      setActiveTab('medications');
    }
  };

  const handlePrintA4Summary = () => {
    showToast('Подготовка страницы резюме к локальной печати...');
    window.print();
  };

  const handleApplyVerification = () => {
    if (verificationModalType) {
      setDismissedPendingIds(prev => new Set([...prev, verificationModalType]));
      showToast('Сведения верифицированы и внесены в медицинскую карту!', 'task_alt');
      setVerificationModalType(null);
    }
  };

  const handleDismissPending = (id: 'magne' | 'ferritin') => {
    setDismissedPendingIds(prev => new Set([...prev, id]));
    showToast('Сведения отклонены', 'close');
  };

  // Translations
  const t = useMemo(() => {
    if (lang === 'FR') {
      return {
        title: 'Résumé de Santé',
        subtitle: 'Historique médical, examens biologiques et paramètres vitaux',
        btnSummary: 'Créer résumé',
        tabOverview: 'Обзор',
        tabConditions: 'Диагнозы',
        tabLabs: 'Анализы и тренды',
        tabMedications: 'Лекарства',
        tabVaccines: 'Прививки',
        tabFitness: 'Активность и сон',
        tabHistory: 'История',
        tabSummary: 'Резюме',
      };
    }
    if (lang === 'EN') {
      return {
        title: 'Health Summary',
        subtitle: 'Medical history, lab diagnostics, and vitals',
        btnSummary: 'Generate Summary',
        tabOverview: 'Обзор',
        tabConditions: 'Диагнозы',
        tabLabs: 'Анализы и тренды',
        tabMedications: 'Лекарства',
        tabVaccines: 'Прививки',
        tabFitness: 'Активность и сон',
        tabHistory: 'История',
        tabSummary: 'Резюме',
      };
    }
    return {
      title: 'Сводка здоровья',
      subtitle: 'Медицинская история, исследования и показатели здоровья',
      btnSummary: 'Создать резюме',
      tabOverview: 'Обзор',
      tabConditions: 'Диагнозы',
      tabLabs: 'Анализы и тренды',
      tabMedications: 'Лекарства',
      tabVaccines: 'Прививки',
      tabFitness: 'Активность и сон',
      tabHistory: 'История',
      tabSummary: 'Резюме',
    };
  }, [lang]);

  return (
    <div className="flex flex-col w-full text-[#111d23] gap-3 relative">
      {/* Target Print CSS to ensure only the A4 sheet prints */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #a4ReportSheet, #a4ReportSheet * {
            visibility: visible !important;
          }
          #a4ReportSheet {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            min-height: 100% !important;
            margin: 0 !important;
            padding: 24px !important;
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>

      {/* EMERGENCY / SECRET DISCONNECTED ALERT BANNER (UX-032) */}
      {showSecretDisconnectedBanner && (
        <div className="w-full bg-[#ffdad6] text-[#93000a] px-4 py-2.5 rounded-xl border border-[#ba1a1a]/30 flex items-center justify-between text-[12px] shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#ba1a1a] shrink-0" />
            <span>
              <strong>Внимание (UX-032):</strong> Секретный том PersonalVault заблокирован. Данные категории Secret скрыты. Отображаются только общедоступные сведения архива Open.
            </span>
          </div>
          <button 
            onClick={() => setShowSecretDisconnectedBanner(false)}
            className="text-[#93000a] hover:opacity-75 p-1 rounded transition-opacity"
            title="Скрыть предупреждение"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-xl px-5 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-rose-600" />
              {t.title}
            </h1>
            <span className="px-2 py-0.5 rounded text-xs font-mono bg-teal-50 text-[#006763] border border-teal-200">
              v2.4-clinical
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono text-slate-500 bg-slate-100 hidden sm:inline-block">
              Синхр: 24.10.2026, 14:10
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {t.subtitle}
          </p>
        </div>

        {/* Controls Bar: Search, Language, Security Zone, Create Summary */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Search Input */}
          <div className="relative w-full sm:w-60 lg:w-72">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input 
              type="text"
              value={searchQuery}
              onChange={e => handleSearchChange(e.target.value)}
              placeholder="Поиск по диагнозам, врачам..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#006763]"
            />
          </div>

          {/* Language Selector */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-md border border-slate-200 text-xs font-medium">
            {(['RU', 'EN', 'FR'] as const).map(l => (
              <button
                key={l}
                onClick={() => {
                  setLang(l);
                  showToast(`Язык выписки переключен на ${l}`);
                }}
                className={`px-2.5 py-1 rounded transition-all ${
                  lang === l ? 'bg-[#006763] text-white shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Security Zone Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setIsSecurityDropdownOpen(!isSecurityDropdownOpen)}
              className="h-8 px-2.5 flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors"
            >
              <ShieldCheck className={`w-3.5 h-3.5 ${isSecretEffectiveLocked ? 'text-slate-500' : 'text-[#006763]'}`} />
              <span>{isSecretEffectiveLocked ? 'Только Open' : 'Open + Secret'}</span>
            </button>
            {isSecurityDropdownOpen && (
              <div className="absolute right-0 mt-1 w-52 bg-white rounded-md border border-slate-200 shadow-lg py-1 z-30 text-xs">
                <button
                  onClick={() => {
                    setSecurityFilterMode('ALL');
                    setIsSecurityDropdownOpen(false);
                    if (!isVeraCryptMounted) {
                      toggleVeraCrypt();
                      showToast('Том VeraCrypt подключен. Категория Secret расшифрована.');
                    }
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center justify-between"
                >
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#006763]"></span>
                    Open + Secret (Все)
                  </span>
                  {!isSecretEffectiveLocked && <Check className="w-3.5 h-3.5 text-[#006763]" />}
                </button>
                <button
                  onClick={() => {
                    setSecurityFilterMode('OPEN_ONLY');
                    setIsSecurityDropdownOpen(false);
                    setShowSecretDisconnectedBanner(true);
                    showToast('Включен режим Только Open. Секретные данные скрыты (UX-032).');
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center justify-between text-slate-700"
                >
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                    Только Open
                  </span>
                  {isSecretEffectiveLocked && <Check className="w-3.5 h-3.5 text-[#006763]" />}
                </button>
              </div>
            )}
          </div>

          {/* Primary Action: Create Summary */}
          <button
            onClick={() => setActiveTab('summary')}
            className="h-8 px-3.5 bg-[#006763] hover:bg-[#00524f] text-white rounded-md text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{t.btnSummary}</span>
          </button>
        </div>
      </div>

      {/* Tabs Bar (Preserves existing app styling, with 8 tabs) */}
      <div className="bg-white border border-slate-200 rounded-xl px-4 flex items-center gap-1 overflow-x-auto text-xs shadow-xs select-none">
        {[
          { id: 'overview', label: t.tabOverview, icon: Activity },
          { id: 'conditions', label: `${t.tabConditions} (${visibleConditions.length})`, icon: Stethoscope },
          { id: 'labs', label: `${t.tabLabs} (${visibleLabs.length})`, icon: TrendingUp },
          { id: 'medications', label: `${t.tabMedications} (3)`, icon: Pill },
          { id: 'vaccines', label: `${t.tabVaccines} (4)`, icon: Syringe },
          { id: 'fitness', label: t.tabFitness, icon: Watch },
          { id: 'history', label: t.tabHistory, icon: Clock },
          { id: 'summary', label: t.tabSummary, icon: FileText }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                if (tab.id === 'conditions') {
                  setSelectedConditionDetail(null);
                }
              }}
              className={`py-3 px-3 border-b-2 font-medium flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                isActive 
                  ? 'border-[#006763] text-[#006763] font-semibold' 
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Workspace Layout (Supports right-side Document Source Preview panel) */}
      <div className="w-full flex gap-3 items-start">
        {/* Primary Content View */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          
          {/* ==================== TAB 1: OVERVIEW ==================== */}
          {activeTab === 'overview' && (
            <div className="w-full space-y-4">
              {!hasHealthData ? (
                /* Empty state */
                <div className="p-12 text-center bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                    <HeartPulse className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-slate-800 text-base">Нет медицинских данных</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    В хранилище PersonalVault пока нет распознанных выписок, анализов или карточек здоровья. 
                    Добавьте документы в раздел «Входящие» или импортируйте архив.
                  </p>
                  <button 
                    onClick={() => {
                      setHasHealthData(true);
                      showToast('Тестовый набор данных загружен');
                    }}
                    className="h-8 px-4 bg-[#006763] text-white font-medium text-xs rounded-md shadow-xs hover:bg-[#00524f] transition-colors"
                  >
                    Загрузить клинический профиль
                  </button>
                </div>
              ) : (
                <>
                  {/* 4 Primary Summary Cards (2x2 Grid) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Card 1: Conditions */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-teal-300 transition-colors">
                      <div>
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                            <Stethoscope className="w-4 h-4 text-[#006763]" />
                            Заболевания
                          </span>
                          <span className="text-xs font-mono text-[#006763] bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                            {visibleConditions.filter(c => c.status === 'active').length} активных
                          </span>
                        </div>
                        <div className="mt-3 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-800 text-sm">АГ II стадии, риск 2</span>
                            <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200">
                              Контролируемая
                            </span>
                          </div>
                          <p className="text-slate-500 leading-relaxed">
                            Диагноз кардиолога от 12.09.2026. Целевое артериальное давление достигнуто на монотерапии.
                          </p>
                          <div className="pt-1 flex items-center gap-1.5 text-[11px] text-[#006763]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>1 требует планового осмотра через 4 мес.</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 pt-2.5 border-t border-slate-100 flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-mono">Всего диагнозов: {visibleConditions.length}</span>
                        <button 
                          onClick={() => {
                            setActiveTab('conditions');
                            setSelectedConditionDetail('hypertension');
                          }}
                          className="text-[#006763] hover:text-[#00524f] font-medium flex items-center gap-1"
                        >
                          <span>Перейти к диагнозам</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Card 2: Diagnostics / Labs */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-teal-300 transition-colors">
                      <div>
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                            <TrendingUp className="w-4 h-4 text-[#006763]" />
                            Исследования
                          </span>
                          <span className="text-xs font-mono text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                            1 вне референса
                          </span>
                        </div>
                        <div className="mt-3 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-800 text-sm">Ферритин</span>
                            <span className="font-mono font-bold text-rose-600 text-sm">18 мкг/л ↓</span>
                          </div>
                          <p className="text-slate-500 leading-relaxed">
                            Биохимия от 14.10.2026 (Инвитро). Референс: 20.0 — 250.0 мкг/л. Латентный железодефицит.
                          </p>
                          <div className="pt-1 flex items-center gap-1.5 text-[11px] text-slate-500">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>Последний чекап: 14 октября 2026 (5 показателей)</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 pt-2.5 border-t border-slate-100 flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-mono">6 анализов в динамике</span>
                        <button 
                          onClick={() => {
                            setActiveTab('labs');
                            setSelectedLabTest('ferritin');
                          }}
                          className="text-[#006763] hover:text-[#00524f] font-medium flex items-center gap-1"
                        >
                          <span>Посмотреть графики</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Card 3: Medications */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-teal-300 transition-colors">
                      <div>
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                            <Pill className="w-4 h-4 text-[#006763]" />
                            Лекарства
                          </span>
                          <span className="text-xs font-mono text-[#006763] bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                            1 текущий
                          </span>
                        </div>
                        <div className="mt-3 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-800 text-sm">Периндоприл 5 мг</span>
                            <span className="text-slate-500 font-mono">1 р/сут утром</span>
                          </div>
                          <p className="text-slate-500 leading-relaxed">
                            Рецепт продлен 10.09.2026. Приём без пропусков по схеме кардиолога.
                          </p>
                          <div className="pt-1 flex items-center gap-1.5 text-[11px] text-slate-500">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                            <span>2 назначенных курса завершены</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 pt-2.5 border-t border-slate-100 flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-mono">Схема приема актуальна</span>
                        <button 
                          onClick={() => setActiveTab('medications')}
                          className="text-[#006763] hover:text-[#00524f] font-medium flex items-center gap-1"
                        >
                          <span>К списку лекарств</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Card 4: Vaccines */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-teal-300 transition-colors">
                      <div>
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                            <Syringe className="w-4 h-4 text-[#006763]" />
                            Прививки
                          </span>
                          <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                            4 записи
                          </span>
                        </div>
                        <div className="mt-3 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-800 text-sm">Грипп (Сезон 2025/26)</span>
                            <span className="text-slate-500 font-mono">Ваксигрип Тетра</span>
                          </div>
                          <p className="text-slate-500 leading-relaxed">
                            Сделана 18.10.2025. Плановая ревакцинация АДС-М: июнь 2028 года.
                          </p>
                          <div className="pt-1 flex items-center gap-1.5 text-[11px] text-emerald-700">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Национальный календарь привит полностью</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 pt-2.5 border-t border-slate-100 flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-mono">Сертификаты подтверждены</span>
                        <button 
                          onClick={() => setActiveTab('vaccines')}
                          className="text-[#006763] hover:text-[#00524f] font-medium flex items-center gap-1"
                        >
                          <span>Карта вакцинации</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Compact Horizontal Snapshot: Activity & Sleep */}
                  <div 
                    onClick={() => setActiveTab('fitness')}
                    className="w-full bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 hover:border-teal-300 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-[#006763] shrink-0">
                        <Watch className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-slate-800 text-sm group-hover:text-[#006763] transition-colors">
                            Активность и сон (За сутки: 24 октября 2026)
                          </h4>
                          <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-mono">
                            Apple Health CSV
                          </span>
                        </div>
                        <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
                          <span>Сон: <strong className="text-slate-800">7 ч 35 мин</strong> (91% норма)</span>
                          <span>•</span>
                          <span>ЧСС покоя: <strong className="text-slate-800">62 уд/мин</strong></span>
                          <span>•</span>
                          <span>Шаги: <strong className="text-slate-800">8 420</strong> / 10 000</span>
                          <span>•</span>
                          <span>Активность: <strong className="text-slate-800">46 мин</strong></span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[#006763] font-semibold">
                      <span>Открыть полный дашборд трекера</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Compact Pending Verification Section */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-[#006763]" />
                        <span className="font-semibold text-slate-800 text-xs">
                          Сведения, требующие проверки пользователя
                        </span>
                        <span className="bg-amber-50 text-amber-800 text-[11px] font-mono px-2 py-0.5 rounded-full border border-amber-200">
                          {2 - dismissedPendingIds.size} записи
                        </span>
                      </div>
                      <span className="text-slate-400 text-xs">Автоматически распознано OCR из новых документов</span>
                    </div>

                    <div className="space-y-2.5">
                      {!dismissedPendingIds.has('magne') && (
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="px-1.5 py-0.2 bg-teal-50 text-[#006763] font-mono text-[10px] rounded border border-teal-200 font-semibold">
                                Рекомендация
                              </span>
                              <span className="font-semibold text-slate-800">
                                «Магне B6 форте 1 таб. х 2 раза/день 30 дней»
                              </span>
                            </div>
                            <p className="text-slate-500">
                              Источник: «Выписка терапевта ГКБ_12.10.2026.pdf» (Стр. 2, раздел «Назначения»). Не добавлено в постоянную схему.
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => setVerificationModalType('magne')}
                              className="px-3 py-1 bg-[#006763] text-white rounded font-medium text-xs hover:bg-[#00524f] transition-colors"
                            >
                              Сверить
                            </button>
                            <button
                              onClick={() => handleDismissPending('magne')}
                              className="px-2.5 py-1 text-slate-500 hover:text-rose-600 rounded text-xs"
                            >
                              Отклонить
                            </button>
                          </div>
                        </div>
                      )}

                      {!dismissedPendingIds.has('ferritin') && (
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="px-1.5 py-0.2 bg-amber-50 text-amber-800 font-mono text-[10px] rounded border border-amber-200 font-semibold">
                                Лабораторный маркер
                              </span>
                              <span className="font-semibold text-slate-800">
                                «Снижение уровня ферритина до 18 мкг/л — Латентный железодефицит?»
                              </span>
                            </div>
                            <p className="text-slate-500">
                              Источник: «Анализ крови_Инвитро_14.10.2026.pdf». Требуется подтверждение врача о внесении диагноза E61.1.
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => setVerificationModalType('ferritin')}
                              className="px-3 py-1 bg-[#006763] text-white rounded font-medium text-xs hover:bg-[#00524f] transition-colors"
                            >
                              Сверить
                            </button>
                            <button
                              onClick={() => handleDismissPending('ferritin')}
                              className="px-2.5 py-1 text-slate-500 hover:text-rose-600 rounded text-xs"
                            >
                              Отклонить
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ==================== TAB 2: CONDITIONS (REGISTRY & DETAILED CARD) ==================== */}
          {activeTab === 'conditions' && (
            <div className="w-full space-y-4">
              {selectedConditionDetail ? (
                /* Sub-view: Detailed Disease Dashboard (e.g. Hypertension) */
                <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-5 text-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
                    <button 
                      onClick={() => setSelectedConditionDetail(null)}
                      className="px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Назад к реестру заболеваний</span>
                    </button>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-[11px]">
                        Статус: Активно
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-[#006763] border border-teal-200 font-mono text-[11px]">
                        Сверено с источником
                      </span>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Гипертоническая болезнь II стадии, риск 2</h2>
                    <p className="text-slate-400 font-mono text-[11px] mt-0.5">
                      Код МКБ-10: I11.9 · Первичная фиксация: 14.05.2021 · Врач: Смирнова Е.А.
                    </p>
                    <p className="text-slate-600 mt-2 leading-relaxed">
                      Хроническое повышение артериального давления без поражения органов-мишеней в декомпенсированной форме. 
                      Целевое артериальное давление по клиническому протоколу: 120–129 / 70–79 мм рт. ст.
                    </p>
                  </div>

                  {/* Interactive Blood Pressure Line Chart */}
                  <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <h3 className="font-semibold text-slate-800 text-sm">Динамика артериального давления (САД / ДАД)</h3>
                        <p className="text-[11px] text-slate-400">Показатели тонометра (утренние и вечерние замеры)</p>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        {(['30', '90', '365'] as const).map(d => (
                          <button
                            key={d}
                            onClick={() => {
                              setBpTimeframe(d);
                              setChartPointInfo(`Интервал: ${d} дней · Среднее САД: 125 / ДАД: 78 мм рт. ст.`);
                            }}
                            className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                              bpTimeframe === d 
                                ? 'bg-[#006763] text-white shadow-xs' 
                                : 'bg-white text-slate-600 border border-slate-200'
                            }`}
                          >
                            {d === '30' ? '30 дней' : d === '90' ? '90 дней' : '1 год'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* SVG Line Chart */}
                    <div className="w-full bg-white rounded-lg p-3 border border-slate-200/80 overflow-x-auto">
                      <div className="min-w-[620px] h-48 relative">
                        <svg className="w-full h-full" viewBox="0 0 700 180">
                          {/* Shaded Normal Target Zone (115-130 / 70-80) */}
                          <rect fill="#006763" fillOpacity="0.08" height="40" width="630" x="50" y="45" />
                          <line stroke="#006763" strokeDasharray="3,3" strokeWidth="0.8" x1="50" x2="680" y1="45" y2="45" />
                          <line stroke="#006763" strokeDasharray="3,3" strokeWidth="0.8" x1="50" x2="680" y1="85" y2="85" />
                          <text fill="#006763" fontFamily="JetBrains Mono, monospace" fontSize="9" x="682" y="48">130 порог САД</text>
                          <text fill="#006763" fontFamily="JetBrains Mono, monospace" fontSize="9" x="682" y="88">80 порог ДАД</text>

                          {/* Grid Lines */}
                          <line stroke="#e2e8f0" strokeWidth="1" x1="50" x2="680" y1="20" y2="20" />
                          <text fill="#94a3b8" fontFamily="JetBrains Mono, monospace" fontSize="9" x="20" y="24">150</text>
                          <line stroke="#e2e8f0" strokeWidth="1" x1="50" x2="680" y1="65" y2="65" />
                          <text fill="#94a3b8" fontFamily="JetBrains Mono, monospace" fontSize="9" x="20" y="69">120</text>
                          <line stroke="#e2e8f0" strokeWidth="1" x1="50" x2="680" y1="110" y2="110" />
                          <text fill="#94a3b8" fontFamily="JetBrains Mono, monospace" fontSize="9" x="20" y="114">90</text>
                          <line stroke="#e2e8f0" strokeWidth="1" x1="50" x2="680" y1="155" y2="155" />
                          <text fill="#94a3b8" fontFamily="JetBrains Mono, monospace" fontSize="9" x="20" y="159">60</text>

                          {/* Systolic Line (Red) */}
                          <polyline 
                            fill="none" 
                            points="60,58 110,50 160,52 210,42 260,60 310,56 360,48 410,53 460,51 510,49 560,54 610,47 660,50" 
                            stroke="#ba1a1a" 
                            strokeWidth="2" 
                          />
                          {/* Diastolic Line (Teal) */}
                          <polyline 
                            fill="none" 
                            points="60,118 110,112 160,115 210,105 260,122 310,116 360,110 410,114 460,112 510,110 560,115 610,108 660,112" 
                            stroke="#006763" 
                            strokeWidth="2" 
                          />

                          {/* Interactive data points */}
                          <circle cx="660" cy="50" fill="#ba1a1a" r="4.5" className="cursor-pointer" onClick={() => setChartPointInfo('24.10: 124 / 78 мм рт. ст. (САД 124, ДАД 78)')} />
                          <circle cx="660" cy="112" fill="#006763" r="4.5" className="cursor-pointer" onClick={() => setChartPointInfo('24.10: 124 / 78 мм рт. ст. (САД 124, ДАД 78)')} />
                          <circle cx="210" cy="42" fill="#ba1a1a" r="4.5" className="cursor-pointer" onClick={() => setChartPointInfo('Пик 10.10: 138 / 88 мм рт. ст. (После нагрузки)')} />
                          <circle cx="210" cy="105" fill="#006763" r="4.5" className="cursor-pointer" onClick={() => setChartPointInfo('Пик 10.10: 138 / 88 мм рт. ст. (После нагрузки)')} />

                          {/* Date markers */}
                          <text fill="#64748b" fontFamily="JetBrains Mono, monospace" fontSize="9" x="60" y="172">25 Сен</text>
                          <text fill="#64748b" fontFamily="JetBrains Mono, monospace" fontSize="9" x="210" y="172">05 Окт</text>
                          <text fill="#64748b" fontFamily="JetBrains Mono, monospace" fontSize="9" x="360" y="172">12 Окт</text>
                          <text fill="#64748b" fontFamily="JetBrains Mono, monospace" fontSize="9" x="510" y="172">19 Окт</text>
                          <text fill="#64748b" fontFamily="JetBrains Mono, monospace" fontSize="9" x="640" y="172">24 Окт</text>
                        </svg>
                      </div>
                      <div className="flex items-center justify-between text-xs pt-2 text-slate-500 font-mono border-t border-slate-100">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1.5"><span className="w-3 h-1 bg-[#ba1a1a] inline-block"></span> САД</span>
                          <span className="flex items-center gap-1.5"><span className="w-3 h-1 bg-[#006763] inline-block"></span> ДАД</span>
                          <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-teal-100 border border-teal-300 inline-block"></span> Норма</span>
                        </div>
                        <span className="text-[#006763] font-semibold">{chartPointInfo}</span>
                      </div>
                    </div>
                  </div>

                  {/* Treatment & Linked Sources Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-2.5">
                      <h4 className="font-semibold text-slate-800 text-sm">Назначенная терапия</h4>
                      <div className="space-y-2">
                        <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex justify-between items-start">
                          <div>
                            <span className="font-semibold text-slate-800">Периндоприл 5 мг</span>
                            <p className="text-slate-500 text-[11px]">Утром, 1 таблетка натощак. Контроль давления.</p>
                            <span className="text-[10px] text-[#006763] font-mono">Назначен 12.09.2026 кардиологом Смирновой Е.А.</span>
                          </div>
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] rounded font-mono font-medium">
                            Принимается
                          </span>
                        </div>
                        <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex justify-between items-start">
                          <div>
                            <span className="font-semibold text-slate-800">Индапамид 1.5 мг (ретард)</span>
                            <p className="text-slate-500 text-[11px]">В анамнезе (отменен ввиду нормализации показателей).</p>
                            <span className="text-[10px] text-slate-400 font-mono">Курс: Май 2021 – Август 2023</span>
                          </div>
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded font-mono font-medium">
                            Отменен
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-2.5">
                      <h4 className="font-semibold text-slate-800 text-sm">Связанные архивные источники</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="w-4 h-4 text-[#006763] shrink-0" />
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-800 truncate">Консультация кардиолога_12.09.2026.pdf</div>
                              <div className="text-[10px] text-slate-400">ГКБ №1, к.м.н. Смирнова Е.А. · Стр. 1-2</div>
                            </div>
                          </div>
                          <button 
                            onClick={() => setDocPreviewKey('cardio_sept')}
                            className="px-2.5 py-1 bg-[#006763] text-white rounded text-[11px] font-medium shrink-0"
                          >
                            Оригинал
                          </button>
                        </div>

                        <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="w-4 h-4 text-[#006763] shrink-0" />
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-800 truncate">Эхокардиография (УЗИ сердца)_2024.pdf</div>
                              <div className="text-[10px] text-slate-400">Фракция выброса 64%, гипертрофия ЛЖ</div>
                            </div>
                          </div>
                          <button 
                            onClick={() => setDocPreviewKey('echo_heart')}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium shrink-0"
                          >
                            Оригинал
                          </button>
                        </div>

                        {/* Missing File Source Simulation */}
                        <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-rose-200">
                          <div className="flex items-center gap-2 min-w-0">
                            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-800 truncate">Справка_диспансеризация_2021.pdf</div>
                              <div className="text-[10px] text-rose-600">Файл перемещен или внешний диск отключен</div>
                            </div>
                          </div>
                          <button 
                            onClick={() => setDocPreviewKey('missing_file')}
                            className="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded text-[11px] font-medium shrink-0"
                          >
                            Проверить
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Sub-view: Conditions Registry Table */
                <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden space-y-3 p-4 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-100">
                    <div>
                      <span className="font-semibold text-slate-800 text-sm">Реестр заболеваний и состояний</span>
                      <span className="text-slate-400 font-mono ml-2">(МКБ-10 / Верифицировано)</span>
                    </div>

                    <div className="flex items-center gap-1 font-medium">
                      <span className="text-slate-500 mr-1">Статус:</span>
                      {(['all', 'active', 'anamnesis', 'review'] as const).map(st => (
                        <button
                          key={st}
                          onClick={() => setConditionStatusFilter(st)}
                          className={`px-2.5 py-1 rounded transition-all ${
                            conditionStatusFilter === st 
                              ? 'bg-[#006763] text-white shadow-xs font-semibold' 
                              : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {st === 'all' ? 'Все' : st === 'active' ? 'Активные' : st === 'anamnesis' ? 'В анамнезе' : 'На проверке'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-medium">
                          <th className="py-2.5 px-3">Код МКБ</th>
                          <th className="py-2.5 px-3">Заболевание / Формулировка</th>
                          <th className="py-2.5 px-3">Статус</th>
                          <th className="py-2.5 px-3">Манифестация</th>
                          <th className="py-2.5 px-3">Посл. запись</th>
                          <th className="py-2.5 px-3">Документы</th>
                          <th className="py-2.5 px-3 text-right">Действие</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {visibleConditions.map(c => (
                          <tr 
                            key={c.id} 
                            onClick={() => {
                              if (c.id === 'hypertension') {
                                setSelectedConditionDetail('hypertension');
                              } else {
                                setDocPreviewKey(c.id);
                              }
                            }}
                            className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                          >
                            <td className="py-3 px-3 font-mono font-semibold text-[#006763]">
                              {c.code}
                            </td>
                            <td className="py-3 px-3">
                              <div className="font-semibold text-slate-800 flex items-center gap-2">
                                <span>{c.title}</span>
                                {c.zone === 'secret' && (
                                  <span className="px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 font-mono text-[10px] font-semibold border border-purple-200 flex items-center gap-1">
                                    <Lock className="w-2.5 h-2.5" /> Secret
                                  </span>
                                )}
                              </div>
                              <p className="text-slate-500 text-[11px] mt-0.5">{c.notes}</p>
                            </td>
                            <td className="py-3 px-3">
                              <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-medium ${
                                c.status === 'active' 
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                                  : c.status === 'review'
                                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                  : 'bg-slate-100 text-slate-600'
                              }`}>
                                {c.statusLabel}
                              </span>
                            </td>
                            <td className="py-3 px-3 font-mono text-slate-500">{c.manifestDate}</td>
                            <td className="py-3 px-3 font-mono text-slate-700 font-medium">{c.lastVisitDate}</td>
                            <td className="py-3 px-3">
                              <span className="text-[#006763] font-medium flex items-center gap-1">
                                <FileText className="w-3.5 h-3.5" />
                                {c.docsCount} {c.docsCount === 1 ? 'файл' : 'файла'}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              {c.id === 'hypertension' ? (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedConditionDetail('hypertension');
                                  }}
                                  className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-[#006763] rounded border border-teal-200 font-medium"
                                >
                                  Подробнее
                                </button>
                              ) : c.status === 'review' ? (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setVerificationModalType('ferritin');
                                  }}
                                  className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded border border-amber-200 font-medium"
                                >
                                  Верифицировать
                                </button>
                              ) : (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDocPreviewKey(c.id);
                                  }}
                                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium"
                                >
                                  Источник
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================== TAB 3: LABS (LONGITUDINAL DIAGNOSTICS) ==================== */}
          {activeTab === 'labs' && (
            <div className="w-full space-y-4 text-xs">
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="font-semibold text-slate-800 text-sm">Лабораторные исследования</span>
                  <span className="text-slate-400 font-mono ml-2">(Биохимия, ОАК, Гормоны)</span>
                </div>
                <div className="flex items-center gap-1 font-medium">
                  {(['all', 'biochem', 'blood', 'hormones'] as const).map(cat => (
                    <button
                      key={cat}
                      onClick={() => setLabCategoryFilter(cat)}
                      className={`px-2.5 py-1 rounded transition-all ${
                        labCategoryFilter === cat 
                          ? 'bg-[#006763] text-white shadow-xs font-semibold' 
                          : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {cat === 'all' ? 'Все' : cat === 'biochem' ? 'Биохимия' : cat === 'blood' ? 'ОАК' : 'Гормоны'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Split: Labs Table (7 cols) + Longitudinal Graph Panel (5 cols) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-medium">
                        <th className="py-2.5 px-3">Анализ</th>
                        <th className="py-2.5 px-3">Значение</th>
                        <th className="py-2.5 px-3">Референс</th>
                        <th className="py-2.5 px-3">Дата</th>
                        <th className="py-2.5 px-3 text-right">Статус</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {visibleLabs.map(l => {
                        const isSelected = activeLabData.id === l.id;
                        return (
                          <tr 
                            key={l.id}
                            onClick={() => setSelectedLabTest(l.id)}
                            className={`cursor-pointer transition-colors ${
                              isSelected ? 'bg-teal-50/60 border-l-4 border-[#006763]' : 'hover:bg-slate-50/80'
                            }`}
                          >
                            <td className="py-3 px-3">
                              <div className="font-semibold text-slate-800 flex items-center gap-2">
                                <span>{l.name}</span>
                                {l.zone === 'secret' && (
                                  <span className="px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 font-mono text-[9px] font-semibold border border-purple-200">
                                    SECRET
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-400">{l.source}</span>
                            </td>
                            <td className="py-3 px-3 font-mono font-bold">
                              <span className={l.status === 'low' ? 'text-rose-600' : 'text-slate-800'}>
                                {l.val} {l.unit}
                              </span>
                            </td>
                            <td className="py-3 px-3 font-mono text-slate-500">{l.norm}</td>
                            <td className="py-3 px-3 font-mono text-slate-500">{l.date}</td>
                            <td className="py-3 px-3 text-right">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-medium ${
                                l.status === 'low' 
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}>
                                {l.statusLabel}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Right: Selected Lab Dynamic Graph Panel */}
                <div className="lg:col-span-5 bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between pb-2 border-b border-slate-100">
                      <div>
                        <h4 className="font-semibold text-slate-800 text-sm">{activeLabData.name} ({activeLabData.unit})</h4>
                        <span className="text-slate-400 text-[11px]">Динамика за 24 месяца (3 измерения)</span>
                      </div>
                      <button 
                        onClick={() => setDocPreviewKey('lab_invitro_oct')}
                        className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-[#006763] rounded border border-teal-200 text-[11px] font-medium"
                      >
                        Сертификат
                      </button>
                    </div>

                    {/* SVG Sparkline / Trend */}
                    <div className="p-3 bg-slate-50/80 rounded-lg border border-slate-200/80">
                      <svg className="w-full h-36" viewBox="0 0 350 140">
                        {/* Shaded Normal Band */}
                        <rect fill="#006763" fillOpacity="0.08" height="75" width="290" x="30" y="25" />
                        <line stroke="#006763" strokeDasharray="2,2" strokeWidth="0.8" x1="30" x2="320" y1="25" y2="25" />
                        <line stroke="#ba1a1a" strokeDasharray="2,2" strokeWidth="0.8" x1="30" x2="320" y1="100" y2="100" />
                        <text fill="#006763" fontFamily="JetBrains Mono, monospace" fontSize="8" x="322" y="28">250 max</text>
                        <text fill="#ba1a1a" fontFamily="JetBrains Mono, monospace" fontSize="8" x="322" y="103">20 min</text>

                        {/* Trend points line */}
                        <polyline 
                          fill="none" 
                          points="60,82 175,93 290,108" 
                          stroke="#006763" 
                          strokeWidth="2" 
                        />
                        <circle cx="60" cy="82" fill="#006763" r="4" />
                        <text fill="#1e293b" fontFamily="JetBrains Mono, monospace" fontSize="9" x="52" y="75">45</text>
                        <text fill="#64748b" fontFamily="JetBrains Mono, monospace" fontSize="8" x="45" y="125">12.11.24</text>

                        <circle cx="175" cy="93" fill="#006763" r="4" />
                        <text fill="#1e293b" fontFamily="JetBrains Mono, monospace" fontSize="9" x="167" y="86">32</text>
                        <text fill="#64748b" fontFamily="JetBrains Mono, monospace" fontSize="8" x="160" y="125">20.05.25</text>

                        <circle cx="290" cy="108" fill="#ba1a1a" r="4.5" />
                        <text fill="#ba1a1a" fontFamily="JetBrains Mono, monospace" fontSize="9" fontWeight="bold" x="280" y="120">18 ↓</text>
                        <text fill="#64748b" fontFamily="JetBrains Mono, monospace" fontSize="8" x="275" y="135">14.10.26</text>
                      </svg>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Текущий показатель:</span>
                        <span className={`font-mono font-bold ${activeLabData.status === 'low' ? 'text-rose-600' : 'text-slate-800'}`}>
                          {activeLabData.val} {activeLabData.unit} ({activeLabData.statusLabel})
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Референсный интервал:</span>
                        <span className="font-mono text-slate-700">{activeLabData.norm} {activeLabData.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Файл в архиве:</span>
                        <span className="font-mono text-[#006763] truncate max-w-[200px]">{activeLabData.fileName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Контрольная сумма:</span>
                        <span className="font-mono text-slate-400 text-[10px]">sha256:{activeLabData.sha}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg text-[11px] text-teal-900 leading-relaxed">
                      <strong>Заключение врача:</strong> {activeLabData.interpretation}
                    </div>
                  </div>

                  <button 
                    onClick={() => setDocPreviewKey('lab_invitro_oct')}
                    className="w-full py-2 bg-[#006763] text-white rounded-md font-medium text-xs hover:bg-[#00524f] transition-colors flex items-center justify-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Открыть оригинал бланка</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ==================== TAB 4: MEDICATIONS ==================== */}
          {activeTab === 'medications' && (
            <div className="w-full space-y-4 text-xs">
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex justify-between items-center">
                <div>
                  <span className="font-semibold text-slate-800 text-sm">Схема медикаментозной терапии</span>
                  <span className="text-slate-400 font-mono ml-2">Фармакотерапия / Рецепты</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-[#006763] border border-teal-200 font-mono">
                  1 активный курс
                </span>
              </div>

              {/* Group 1: Current Confirmed */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#006763]"></span>
                  <h4 className="font-semibold uppercase tracking-wider text-[#006763] text-[11px]">
                    Текущие подтверждённые препараты (1)
                  </h4>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-sm">Периндоприл (Perindopril)</span>
                      <span className="px-2 py-0.5 bg-teal-50 text-[#006763] text-[10px] font-mono rounded border border-teal-200">
                        5 мг · Таблетки
                      </span>
                    </div>
                    <p className="text-slate-600">Схема: 1 таблетка утром натощак. Для снижения артериального давления.</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                      <span>Рецепт от 10.09.2026</span>
                      <span>•</span>
                      <span>Врач: Смирнова Е.А.</span>
                      <span>•</span>
                      <span>Срок курса: Постоянно</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setDocPreviewKey('cardio_sept')}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Рецептурный бланк</span>
                  </button>
                </div>
              </div>

              {/* Group 2: Requires Clarification */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <h4 className="font-semibold uppercase tracking-wider text-amber-700 text-[11px]">
                    Назначения, требующие уточнения (1)
                  </h4>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-sm">Магне B6 форте</span>
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-800 text-[10px] font-mono rounded border border-amber-200">
                        Таблетки
                      </span>
                    </div>
                    <p className="text-slate-600">
                      Рекомендация в выписке от 12.10.2026. Курс 30 дней. Требуется подтверждение факта начала приёма.
                    </p>
                    <span className="text-[11px] text-amber-700 font-mono">Не внесено в регулярный календарь</span>
                  </div>
                  <button 
                    onClick={() => setVerificationModalType('magne')}
                    className="px-3.5 py-1.5 bg-[#006763] hover:bg-[#00524f] text-white rounded-md font-medium shadow-xs transition-colors"
                  >
                    Подтвердить приём
                  </button>
                </div>
              </div>

              {/* Group 3: Anamnesis / Completed */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                  <h4 className="font-semibold uppercase tracking-wider text-slate-500 text-[11px]">
                    В анамнезе / Завершенные курсы (2)
                  </h4>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 shadow-xs divide-y divide-slate-100">
                  <div className="p-3.5 flex justify-between items-center">
                    <div>
                      <span className="font-semibold text-slate-800">Амоксиклав 1000 мг</span>
                      <p className="text-slate-500 text-[11px]">Курс 7 дней при бронхите. Завершен 15.02.2025.</p>
                    </div>
                    <span className="text-slate-400 font-mono text-[11px]">Завершен</span>
                  </div>
                  <div className="p-3.5 flex justify-between items-center">
                    <div>
                      <span className="font-semibold text-slate-800">Супрастинекс 5 мг</span>
                      <p className="text-slate-500 text-[11px]">Сезонный курс при поллинозе. Май 2025.</p>
                    </div>
                    <span className="text-slate-400 font-mono text-[11px]">Завершен</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== TAB 5: VACCINES ==================== */}
          {activeTab === 'vaccines' && (
            <div className="w-full space-y-4 text-xs">
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex justify-between items-center">
                <div>
                  <span className="font-semibold text-slate-800 text-sm">Карта профилактических прививок</span>
                  <span className="text-slate-400 font-mono ml-2">Сертификаты и ревакцинация</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono">
                  Календарь актуален
                </span>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-medium">
                      <th className="py-2.5 px-3">Инфекция / Препарат</th>
                      <th className="py-2.5 px-3">Серия / Партия</th>
                      <th className="py-2.5 px-3">Дата введения</th>
                      <th className="py-2.5 px-3">Медицинская организация</th>
                      <th className="py-2.5 px-3">Ревакцинация</th>
                      <th className="py-2.5 px-3 text-right">Сертификат</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800">Грипп (Ваксигрип Тетра)</div>
                        <span className="text-[11px] text-slate-400">Сезонная иммунизация 2025/2026</span>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-500">U1840-2</td>
                      <td className="py-3 px-3 font-mono text-slate-700 font-medium">18.10.2025</td>
                      <td className="py-3 px-3 text-slate-600">Поликлиника №4, Москва</td>
                      <td className="py-3 px-3 font-mono text-slate-500">Осень 2026</td>
                      <td className="py-3 px-3 text-right">
                        <button 
                          onClick={() => setDocPreviewKey('vaccine_flu')}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium"
                        >
                          PDF
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800">Дифтерия, столбняк (АДС-М)</div>
                        <span className="text-[11px] text-slate-400">Плановая ревакцинация взрослых</span>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-500">B-4491</td>
                      <td className="py-3 px-3 font-mono text-slate-700 font-medium">12.06.2018</td>
                      <td className="py-3 px-3 text-slate-600">ГП №115</td>
                      <td className="py-3 px-3 font-mono text-[#006763] font-semibold">Июнь 2028</td>
                      <td className="py-3 px-3 text-right">
                        <button 
                          onClick={() => setDocPreviewKey('vaccine_adsm')}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium"
                        >
                          PDF
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800">Гепатит В (Эувакс В)</div>
                        <span className="text-[11px] text-slate-400">Полный курс V1, V2, V3</span>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-500">K-9021</td>
                      <td className="py-3 px-3 font-mono text-slate-700 font-medium">2010 (V3)</td>
                      <td className="py-3 px-3 text-slate-600">Студенческая поликлиника</td>
                      <td className="py-3 px-3 font-mono text-slate-500">Титр антител в норме</td>
                      <td className="py-3 px-3 text-right">
                        <button 
                          onClick={() => setDocPreviewKey('vaccine_hepb')}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium"
                        >
                          PDF
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800">COVID-19 (Спутник Лайт)</div>
                        <span className="text-[11px] text-slate-400">Бустерная доза</span>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-500">SL-40291</td>
                      <td className="py-3 px-3 font-mono text-slate-700 font-medium">04.11.2022</td>
                      <td className="py-3 px-3 text-slate-600">Центр вакцинации Гостиный двор</td>
                      <td className="py-3 px-3 font-mono text-slate-500">По эпидпоказаниям</td>
                      <td className="py-3 px-3 text-right">
                        <button 
                          onClick={() => setDocPreviewKey('vaccine_covid')}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium"
                        >
                          PDF
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==================== TAB 6: FITNESS & SLEEP ==================== */}
          {activeTab === 'fitness' && (
            <div className="w-full space-y-4 text-xs">
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="font-semibold text-slate-800 text-sm">Активность и сон — Носимое устройство</span>
                  <span className="text-slate-400 font-mono ml-2">via Apple Health CSV</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-slate-100 rounded-md p-0.5 border border-slate-200 text-xs">
                    <button 
                      onClick={() => setTrackerDateOffset(prev => prev - 1)}
                      className="px-2 py-0.5 text-slate-600 hover:text-slate-900"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-2 font-mono text-slate-800 font-medium">
                      {trackerDateOffset === 0 ? '24 октября 2026' : `${24 + trackerDateOffset} октября 2026`}
                    </span>
                    <button 
                      onClick={() => setTrackerDateOffset(prev => prev + 1)}
                      className="px-2 py-0.5 text-slate-600 hover:text-slate-900"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <button 
                    onClick={() => {
                      setImportHasError(false);
                      setIsImportModalOpen(true);
                    }}
                    className="h-8 px-3 bg-[#006763] hover:bg-[#00524f] text-white rounded-md font-medium flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Импорт CSV / JSON</span>
                  </button>
                </div>
              </div>

              {!hasBraceletData ? (
                /* Empty bracelet state */
                <div className="p-12 text-center bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
                  <Watch className="w-12 h-12 text-slate-300 mx-auto" />
                  <h3 className="font-semibold text-slate-800 text-sm">Нет данных фитнес-трекера</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Выгрузка показателей пульса, шагов и фаз сна пока не загружена. 
                    Импортируйте файл из Apple Health или Garmin Connect.
                  </p>
                  <button
                    onClick={() => {
                      setImportHasError(false);
                      setIsImportModalOpen(true);
                    }}
                    className="h-8 px-4 bg-[#006763] text-white rounded-md text-xs font-medium"
                  >
                    Импортировать данные
                  </button>
                </div>
              ) : (
                <>
                  {/* 5 Metric Tiles */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                      <span className="text-slate-500 uppercase text-[10px] font-semibold tracking-wider">Сон за ночь</span>
                      <div className="text-xl font-bold font-mono text-slate-800 mt-1">7 ч 35 мин</div>
                      <span className="text-[11px] text-emerald-600 font-mono">+20 мин от среднего</span>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                      <span className="text-slate-500 uppercase text-[10px] font-semibold tracking-wider">ЧСС в покое</span>
                      <div className="text-xl font-bold font-mono text-slate-800 mt-1">62 <span className="text-xs text-slate-400 font-normal">уд/мин</span></div>
                      <span className="text-[11px] text-[#006763] font-mono">Оптимально</span>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                      <span className="text-slate-500 uppercase text-[10px] font-semibold tracking-wider">Шаги</span>
                      <div className="text-xl font-bold font-mono text-slate-800 mt-1">8 420</div>
                      <span className="text-[11px] text-slate-500 font-mono">Цель: 10 000 (84%)</span>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                      <span className="text-slate-500 uppercase text-[10px] font-semibold tracking-wider">Активность</span>
                      <div className="text-xl font-bold font-mono text-slate-800 mt-1">46 <span className="text-xs text-slate-400 font-normal">мин</span></div>
                      <span className="text-[11px] text-emerald-600 font-mono">Норма выполнена</span>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                      <span className="text-slate-500 uppercase text-[10px] font-semibold tracking-wider">Сатурация SpO2</span>
                      <div className="text-xl font-bold font-mono text-slate-800 mt-1">98%</div>
                      <span className="text-[11px] text-emerald-600 font-mono">Нормоксия</span>
                    </div>
                  </div>

                  {/* Hypnogram Sleep Stages Bar */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <h4 className="font-semibold text-slate-800 text-sm">Гипнограмма стадий сна (23:45 — 07:20)</h4>
                        <p className="text-[11px] text-slate-500">
                          Фазовый состав: Глубокий сон 1ч 40м (22%) · Быстрый (REM) 1ч 50м (24%) · Легкий 3ч 45м (50%) · Бодрствование 20м
                        </p>
                      </div>
                      <span className="font-mono text-xs text-[#006763] bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                        Эффективность сна: 91%
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 space-y-2">
                      <div className="h-10 w-full flex rounded overflow-hidden shadow-2xs">
                        <div className="bg-[#FFA726] h-full" style={{ width: '4%' }} title="Бодрствование (23:45 - 00:05)" />
                        <div className="bg-[#4DB6AC] h-full" style={{ width: '25%' }} title="Легкий сон" />
                        <div className="bg-[#006763] h-full" style={{ width: '22%' }} title="Глубокий сон" />
                        <div className="bg-[#7E57C2] h-full" style={{ width: '14%' }} title="REM-сон" />
                        <div className="bg-[#4DB6AC] h-full" style={{ width: '18%' }} title="Легкий сон" />
                        <div className="bg-[#7E57C2] h-full" style={{ width: '10%' }} title="REM-сон" />
                        <div className="bg-[#4DB6AC] h-full" style={{ width: '7%' }} title="Легкий сон" />
                      </div>
                      <div className="flex items-center flex-wrap gap-4 text-[11px] font-mono text-slate-600 pt-1">
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#FFA726]"></span> Бодрствование (20 мин)</span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#7E57C2]"></span> Быстрый REM (1 ч 50 мин)</span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#4DB6AC]"></span> Лёгкий сон (3 ч 45 мин)</span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#006763]"></span> Глубокий сон (1 ч 40 мин)</span>
                      </div>
                    </div>
                  </div>

                  {/* 2-Column: 7-Day Steps + Daytime HR Curve */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
                      <h4 className="font-semibold text-slate-800 text-sm">Шаги за последние 7 дней</h4>
                      <div className="h-36 flex items-end justify-between gap-2 pt-4 px-2">
                        {[
                          { day: 'Пн', val: '7.1k', h: 65, active: false },
                          { day: 'Вт', val: '9.4k', h: 85, active: false },
                          { day: 'Ср', val: '11.2k', h: 100, active: false },
                          { day: 'Чт', val: '6.8k', h: 60, active: false },
                          { day: 'Пт', val: '8.9k', h: 80, active: false },
                          { day: 'Сб', val: '10.1k', h: 92, active: false },
                          { day: 'Вс', val: '8.4k', h: 78, active: true },
                        ].map((s, idx) => (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                            <span className={`font-mono text-[10px] ${s.active ? 'text-[#006763] font-bold' : 'text-slate-400'}`}>
                              {s.val}
                            </span>
                            <div 
                              className={`w-full rounded-t-sm transition-all ${
                                s.active ? 'bg-[#006763]' : 'bg-[#006763]/40 hover:bg-[#006763]/60'
                              }`} 
                              style={{ height: `${s.h}%` }} 
                            />
                            <span className={`font-mono text-[10px] ${s.active ? 'text-[#006763] font-bold' : 'text-slate-500'}`}>
                              {s.day}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
                      <h4 className="font-semibold text-slate-800 text-sm">Пульс в течение дня (ЧСС)</h4>
                      <div className="h-36 bg-slate-50 rounded-lg p-2 border border-slate-200/80">
                        <svg className="w-full h-full" viewBox="0 0 300 110">
                          <line stroke="#cbd5e1" strokeDasharray="2,2" x1="20" x2="290" y1="20" y2="20" />
                          <text fill="#94a3b8" fontFamily="JetBrains Mono, monospace" fontSize="7" x="5" y="23">120</text>
                          <line stroke="#cbd5e1" strokeDasharray="2,2" x1="20" x2="290" y1="60" y2="60" />
                          <text fill="#94a3b8" fontFamily="JetBrains Mono, monospace" fontSize="7" x="5" y="63">75</text>
                          <line stroke="#cbd5e1" strokeDasharray="2,2" x1="20" x2="290" y1="95" y2="95" />
                          <text fill="#94a3b8" fontFamily="JetBrains Mono, monospace" fontSize="7" x="5" y="98">50</text>

                          <path 
                            d="M 20 85 Q 50 80, 80 70 T 140 35 T 200 65 T 260 55 T 290 68" 
                            fill="none" 
                            stroke="#ba1a1a" 
                            strokeWidth="1.8" 
                          />
                          <circle cx="140" cy="35" fill="#ba1a1a" r="3" />
                          <text fill="#ba1a1a" fontFamily="JetBrains Mono, monospace" fontSize="8" x="125" y="30">118 уд (Прогулка)</text>
                        </svg>
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                        <span>Мин: 54 уд/мин</span>
                        <span>Средний: 72 уд/мин</span>
                        <span>Макс: 118 уд/мин</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ==================== TAB 7: HISTORY (CLINICAL TIMELINE) ==================== */}
          {activeTab === 'history' && (
            <div className="w-full space-y-4 text-xs">
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-wrap items-center justify-between gap-3">
                <span className="font-semibold text-slate-800 text-sm">Хронологическая лента медицинских событий</span>
                <div className="flex items-center gap-1 font-medium">
                  {(['all', 'consult', 'labs', 'prescriptions'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setHistoryFilter(f)}
                      className={`px-2.5 py-1 rounded transition-all ${
                        historyFilter === f 
                          ? 'bg-[#006763] text-white shadow-xs font-semibold' 
                          : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {f === 'all' ? 'Все' : f === 'consult' ? 'Консультации' : f === 'labs' ? 'Анализы' : 'Рецепты'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vertical timeline */}
              <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
                {/* Event 1 */}
                <div className="relative flex items-start gap-3 pl-8">
                  <span className="absolute left-2 top-1.5 w-3.5 h-3.5 rounded-full bg-[#006763] border-2 border-white shadow-xs"></span>
                  <div className="flex-1 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] bg-teal-50 text-[#006763] px-1.5 py-0.5 rounded font-semibold border border-teal-200">
                          Лаборатория
                        </span>
                        <span className="font-semibold text-slate-800">Исследование венозной крови (5 показателей)</span>
                      </div>
                      <span className="font-mono text-slate-400 text-[11px]">14.10.2026</span>
                    </div>
                    <p className="text-slate-500">
                      Лаборатория «Инвитро». Ферритин 18 мкг/л (ниже референса), гемоглобин 138 г/л, глюкоза 5.1 ммоль/л.
                    </p>
                    <div className="pt-1">
                      <button 
                        onClick={() => setDocPreviewKey('lab_invitro_oct')}
                        className="text-[#006763] hover:underline text-[12px] font-medium"
                      >
                        Открыть бланк (PDF) →
                      </button>
                    </div>
                  </div>
                </div>

                {/* Event 2 */}
                <div className="relative flex items-start gap-3 pl-8">
                  <span className="absolute left-2 top-1.5 w-3.5 h-3.5 rounded-full bg-slate-500 border-2 border-white shadow-xs"></span>
                  <div className="flex-1 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-semibold">
                          Приём врача
                        </span>
                        <span className="font-semibold text-slate-800">Консультация кардиолога (Плановый осмотр)</span>
                      </div>
                      <span className="font-mono text-slate-400 text-[11px]">12.09.2026</span>
                    </div>
                    <p className="text-slate-500">
                      ГКБ №1. Подтверждена гипертоническая болезнь II стадии, риск 2. Продлена терапия: Периндоприл 5 мг.
                    </p>
                    <div className="pt-1">
                      <button 
                        onClick={() => setDocPreviewKey('cardio_sept')}
                        className="text-[#006763] hover:underline text-[12px] font-medium"
                      >
                        Консультативное заключение (PDF) →
                      </button>
                    </div>
                  </div>
                </div>

                {/* Event 3 */}
                <div className="relative flex items-start gap-3 pl-8">
                  <span className="absolute left-2 top-1.5 w-3.5 h-3.5 rounded-full bg-teal-600 border-2 border-white shadow-xs"></span>
                  <div className="flex-1 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded font-semibold border border-emerald-200">
                          Вакцинация
                        </span>
                        <span className="font-semibold text-slate-800">Ваксигрип Тетра (Сезонный грипп)</span>
                      </div>
                      <span className="font-mono text-slate-400 text-[11px]">18.10.2025</span>
                    </div>
                    <p className="text-slate-500">Вакцинация проведена без осложнений. Серия U1840-2.</p>
                  </div>
                </div>

                {/* Event 4 (Secret Item - Hidden if Secret is locked) */}
                {!isSecretEffectiveLocked && (
                  <div className="relative flex items-start gap-3 pl-8">
                    <span className="absolute left-2 top-1.5 w-3.5 h-3.5 rounded-full bg-purple-600 border-2 border-white shadow-xs"></span>
                    <div className="flex-1 bg-white p-3.5 rounded-xl border border-purple-200 shadow-xs space-y-1.5 bg-purple-50/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Lock className="w-3.5 h-3.5 text-purple-600" />
                          <span className="font-mono text-[10px] bg-purple-50 text-purple-800 px-1.5 py-0.5 rounded font-semibold border border-purple-200">
                            SECRET · Эндоскопия
                          </span>
                          <span className="font-semibold text-slate-800">Видеогастродуоденоскопия (ФГДС)</span>
                        </div>
                        <span className="font-mono text-slate-400 text-[11px]">11.02.2024</span>
                      </div>
                      <p className="text-slate-500">
                        Заключение: Хронический эритематозный гастродуоденит вне обострения. Биопсия на хеликобактер отриц.
                      </p>
                      <div className="pt-1">
                        <button 
                          onClick={() => setDocPreviewKey('fgds_secret')}
                          className="text-purple-700 hover:underline text-[12px] font-medium"
                        >
                          Протокол ФГДС (PDF) →
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================== TAB 8: MEDICAL SUMMARY (PRINTABLE A4) ==================== */}
          {activeTab === 'summary' && (
            <div className="w-full space-y-4 text-xs">
              {/* Configuration Controls Bar */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-100">
                  <span className="font-semibold text-slate-800 text-sm">Конструктор медицинского резюме</span>
                  <button 
                    onClick={handlePrintA4Summary}
                    className="h-8 px-4 bg-[#006763] hover:bg-[#00524f] text-white rounded-md font-medium text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Экспорт в PDF / Печать</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-medium">Тип резюме:</span>
                    <select
                      value={reportType}
                      onChange={e => setReportType(e.target.value as any)}
                      className="h-7 px-2 bg-slate-50 border border-slate-200 rounded text-xs text-slate-800 cursor-pointer"
                    >
                      <option value="emergency">Экстренная карточка (Emergency Summary)</option>
                      <option value="brief">Краткое медицинское резюме (1-2 стр.)</option>
                      <option value="full">Полная медицинская выписка (Анамнез + Исследования)</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-medium">Язык отчёта:</span>
                    <div className="flex items-center bg-slate-100 rounded p-0.5 border border-slate-200">
                      {(['RU', 'EN', 'FR'] as const).map(l => (
                        <button
                          key={l}
                          onClick={() => setReportLang(l)}
                          className={`px-2.5 py-1 rounded transition-all text-xs ${
                            reportLang === l ? 'bg-[#006763] text-white font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {l === 'RU' ? 'Русский' : l === 'EN' ? 'English' : 'Français'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-slate-600">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={includeSecretInReport && !isSecretEffectiveLocked}
                        disabled={isSecretEffectiveLocked}
                        onChange={e => setIncludeSecretInReport(e.target.checked)}
                        className="rounded text-[#006763] focus:ring-[#006763]"
                      />
                      <span>Включить Secret (если открыт)</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={includeQRInReport}
                        onChange={e => setIncludeQRInReport(e.target.checked)}
                        className="rounded text-[#006763] focus:ring-[#006763]"
                      />
                      <span>QR-код верификации</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Realistic A4 Paper Sheet Preview Container */}
              <div className="w-full flex justify-center py-4 bg-slate-100/70 rounded-xl overflow-x-auto border border-slate-200/80">
                <div 
                  id="a4ReportSheet"
                  className="w-[720px] min-h-[920px] bg-white text-[#111d23] shadow-lg p-10 font-sans border border-slate-300 flex flex-col justify-between space-y-6 text-xs leading-relaxed"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex justify-between items-start border-b-2 border-[#006763] pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <HeartPulse className="w-6 h-6 text-[#006763]" />
                          <h1 className="text-xl font-bold tracking-tight text-[#006763] uppercase">
                            {reportLang === 'FR' 
                              ? "RÉSUMÉ MÉDICAL D'URGENCE" 
                              : reportLang === 'EN' 
                              ? "EMERGENCY MEDICAL SUMMARY" 
                              : "ЭКСТРЕННАЯ МЕДИЦИНСКАЯ КАРТОЧКА"}
                          </h1>
                        </div>
                        <div className="text-[11px] text-slate-400 tracking-wider uppercase font-mono mt-0.5">
                          {reportLang === 'FR'
                            ? "DOCUMENTATION MÉDICALE LOCALE · VAULT ID: PV-8492-FR"
                            : reportLang === 'EN'
                            ? "LOCAL ARCHIVAL MEDICAL RECORD · VAULT ID: PV-8492-EN"
                            : "ЛОКАЛЬНЫЙ АРХИВ PERSONALVAULT · ID: PV-8492-RU"}
                        </div>
                      </div>
                      <div className="text-right text-[11px] font-mono text-slate-500">
                        <div>DATE: 24/10/2026</div>
                        <div className="text-[#006763] font-semibold">VALIDE: INTERNATIONAL</div>
                      </div>
                    </div>

                    {/* Patient Identification Strip */}
                    <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded border border-slate-200 text-xs">
                      <div>
                        <span className="text-slate-400 block font-semibold text-[10px]">
                          {reportLang === 'FR' ? 'PATIENT:' : reportLang === 'EN' ? 'PATIENT:' : 'ПАЦИЕНТ:'}
                        </span>
                        <div className="font-bold text-slate-800 text-sm">ИВАНОВ АЛЕКСЕЙ / IVANOV, ALEKSEI</div>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-semibold text-[10px]">
                          {reportLang === 'FR' ? 'NÉ LE / SEXE:' : reportLang === 'EN' ? 'DOB / SEX:' : 'ДАТА РОЖД. / ПОЛ:'}
                        </span>
                        <div className="font-bold text-slate-800">14/05/1988 (38 лет) · M</div>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-semibold text-[10px]">
                          {reportLang === 'FR' ? 'GROUPE SANGUIN:' : reportLang === 'EN' ? 'BLOOD GROUP:' : 'ГРУППА КРОВИ:'}
                        </span>
                        <div className="font-bold text-rose-600">A (II) Rh+ Positif</div>
                      </div>
                    </div>

                    {/* Allergies & Critical Warnings */}
                    <div className="p-3 bg-rose-50/60 rounded border border-rose-200 text-xs">
                      <div className="flex items-center gap-1.5 text-rose-700 font-bold uppercase text-[11px] mb-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>
                          {reportLang === 'FR' 
                            ? 'ALLERGIES ET INTOLÉRANCES:' 
                            : reportLang === 'EN' 
                            ? 'ALLERGIES & WARNINGS:' 
                            : 'АЛЛЕРГИИ И ОСОБЫЕ ПРЕДУПРЕЖДЕНИЯ:'}
                        </span>
                      </div>
                      <p className="font-semibold text-slate-800">
                        • Rhinite allergique saisonnière (Pollen de bouleau / Graminées). Pas d'allergie médicamenteuse connue (Pénicillines: RAS).
                      </p>
                    </div>

                    {/* Pathologies */}
                    <div className="space-y-1.5">
                      <div className="font-bold text-xs uppercase tracking-wider text-[#006763] border-b border-slate-200 pb-0.5">
                        {reportLang === 'FR' 
                          ? 'PATHOLOGIES ACTIVES & ANTÉCÉDENTS:' 
                          : reportLang === 'EN' 
                          ? 'ACTIVE CONDITIONS & HISTORY:' 
                          : 'АКТИВНЫЕ ЗАБОЛЕВАНИЯ И АНАМНЕЗ:'}
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="font-bold">1. Hypertension artérielle essentielle Stade II (CIM-10: I11.9)</span>
                          <span className="text-slate-500 font-mono">Sous traitement · Stabilisée</span>
                        </div>
                        {includeSecretInReport && !isSecretEffectiveLocked && (
                          <div className="flex justify-between py-1 border-b border-slate-100 bg-teal-50/30 px-1">
                            <span className="font-bold">2. Gastroduodénite chronique (CIM-10: K29.5) [Catégorie Protégée]</span>
                            <span className="text-slate-500 font-mono">En rémission</span>
                          </div>
                        )}
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="font-bold">3. Carence martiale latente (CIM-10: E61.1)</span>
                          <span className="text-slate-500 font-mono">Ferritine 18 µg/L (14/10/2026)</span>
                        </div>
                      </div>
                    </div>

                    {/* Current Treatments */}
                    <div className="space-y-1.5">
                      <div className="font-bold text-xs uppercase tracking-wider text-[#006763] border-b border-slate-200 pb-0.5">
                        {reportLang === 'FR' 
                          ? 'TRAITEMENTS EN COURS:' 
                          : reportLang === 'EN' 
                          ? 'CURRENT MEDICATIONS:' 
                          : 'ТЕКУЩИЕ ПРЕПАРАТЫ И ДОЗИРОВКИ:'}
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between py-1.5 bg-slate-50 px-2 rounded">
                          <span className="font-semibold">• Périndopril 5 mg</span>
                          <span>1 comprimé le matin au lever (Voie orale)</span>
                        </div>
                      </div>
                    </div>

                    {/* Recent Labs */}
                    <div className="space-y-1.5">
                      <div className="font-bold text-xs uppercase tracking-wider text-[#006763] border-b border-slate-200 pb-0.5">
                        {reportLang === 'FR' 
                          ? 'DERNIERS RÉSULTATS BIOLOGIQUES (14/10/2026):' 
                          : reportLang === 'EN' 
                          ? 'RECENT LAB RESULTS (14/10/2026):' 
                          : 'ПОСЛЕДНИЕ РЕЗУЛЬТАТЫ ИССЛЕДОВАНИЙ (14.10.2026):'}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                        <div className="p-2 bg-slate-50 rounded">Ferritine: <strong className="text-rose-600 font-bold">18 µg/L</strong> (Norme: 20-250)</div>
                        <div className="p-2 bg-slate-50 rounded">Hémoglobine: <strong>138 g/L</strong> (Norme: 130-160)</div>
                        <div className="p-2 bg-slate-50 rounded">Cholestérol total: <strong>4.82 mmol/L</strong></div>
                        <div className="p-2 bg-slate-50 rounded">Glycémie à jeun: <strong>5.1 mmol/L</strong></div>
                      </div>
                    </div>
                  </div>

                  {/* Sheet Footer */}
                  <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      {includeQRInReport && (
                        <div className="w-14 h-14 bg-slate-100 border border-slate-300 flex items-center justify-center p-1 rounded">
                          <svg className="w-full h-full text-slate-800" viewBox="0 0 24 24">
                            <path d="M2,2H10V10H2V2M4,4V8H8V4H4M14,2H22V10H14V2M16,4V8H20V4H16M2,14H10V22H2V14M4,16V20H8V16H4M14,14H17V17H14V14M19,14H22V17H19V14M17,17H19V19H17V17M14,19H17V22H14V19M19,19H22V22H19V19Z" fill="currentColor" />
                          </svg>
                        </div>
                      )}
                      <div className="space-y-0.5 text-slate-500 text-[11px]">
                        <div>Généré localement via <strong>PersonalVault 2.0</strong></div>
                        <div>Chiffrement AES-256 · Aucune transmission réseau</div>
                        <div className="font-mono text-[10px]">SHA: 7c9a...ef12</div>
                      </div>
                    </div>

                    <div className="text-right space-y-1">
                      <div className="text-slate-400 text-[11px]">SIGNATURE DU PRATICIEN / PATIENT:</div>
                      <div className="h-8 w-40 border-b border-dashed border-slate-400"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* ==================== CONTEXTUAL RIGHT SIDE PANEL (DOCUMENT SOURCE PREVIEW) ==================== */}
        {docPreviewKey && (
          <aside className="w-80 lg:w-96 shrink-0 bg-white border border-slate-200 rounded-xl shadow-xs p-4 flex flex-col justify-between gap-4 sticky top-12 z-20 animate-in slide-in-from-right duration-150">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-1.5 min-w-0">
                  <FileText className="w-4 h-4 text-[#006763] shrink-0" />
                  <span className="font-semibold text-xs text-slate-800 truncate">
                    {docPreviewKey === 'missing_file' 
                      ? 'Справка_диспансеризация_2021.pdf' 
                      : docPreviewKey === 'fgds_secret'
                      ? 'ФГДС_протокол_11.02.2024.pdf (Secret)'
                      : docPreviewKey === 'lab_invitro_oct'
                      ? 'Анализ_крови_Инвитро_14.10.2026.pdf'
                      : 'Консультация кардиолога_12.09.2026.pdf'}
                  </span>
                </div>
                <button 
                  onClick={() => setDocPreviewKey(null)}
                  className="w-6 h-6 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Missing File Notice (State 12) */}
              {docPreviewKey === 'missing_file' ? (
                <div className="p-3 bg-rose-50 text-rose-800 rounded-lg border border-rose-200 space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-rose-700">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Источник недоступен</span>
                  </div>
                  <p className="leading-relaxed">
                    Файл был перемещен, переименован или внешний накопитель отключен.
                    <br />
                    Путь: <code className="font-mono text-[10px]">D:\Vault\Open\Medical\Archive_2021\</code>
                  </p>
                </div>
              ) : (
                /* Document Page Snippet Mockup */
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono pb-1 border-b border-slate-200/60">
                    <span>СТРАНИЦА 1 ИЗ 2</span>
                    <span className="text-[#006763] font-semibold">300 DPI · READ-ONLY</span>
                  </div>

                  <div className="p-3 bg-white rounded border border-slate-200/80 font-mono text-[11px] leading-relaxed select-text space-y-2 shadow-2xs">
                    <div className="font-bold text-center border-b pb-1 text-[#006763]">
                      ГКБ №1 им. Н.И. Пирогова · Кардиология
                    </div>
                    <div><strong>Пациент:</strong> Иванов Алексей Викторович, 1988 г.р.</div>
                    <div><strong>Дата приёма:</strong> 12 сентября 2026 г.</div>
                    <div className="bg-teal-50 p-2 rounded text-slate-800 border border-teal-200/60">
                      «Диагноз основной: Гипертоническая болезнь II стадии, риск 2. Достигнуто целевое АД на монотерапии. Рекомендовано продолжать приём Периндоприла 5 мг утром...»
                    </div>
                    <div className="text-slate-400 text-[10px]">Врач-кардиолог: Смирнова Е.А. (Подпись / Печать)</div>
                  </div>
                </div>
              )}

              {/* Metadata & Path Info */}
              <div className="space-y-1 text-xs">
                <span className="font-semibold text-slate-500 uppercase text-[10px] tracking-wider">
                  Параметры безопасности
                </span>
                <div className="p-2.5 bg-slate-50 rounded-lg font-mono text-[11px] space-y-1 text-slate-600 border border-slate-200/60">
                  <div>
                    <strong className="text-slate-800">Том:</strong>{' '}
                    {docPreviewKey === 'missing_file' 
                      ? 'Внешний диск E: (Офлайн)' 
                      : docPreviewKey === 'fgds_secret' 
                      ? 'PersonalVault / Secret Encrypted (D:\\)' 
                      : 'PersonalVault / Open (D:\\)'}
                  </div>
                  <div>
                    <strong className="text-slate-800">SHA-256:</strong>{' '}
                    <span className="break-all text-[10px]">9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08</span>
                  </div>
                  <div>
                    <strong className="text-slate-800">Статус:</strong>{' '}
                    {docPreviewKey === 'missing_file' 
                      ? <span className="text-rose-600 font-semibold">Файл не найден</span> 
                      : <span className="text-emerald-700 font-semibold">Целостность подтверждена</span>}
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => showToast('Открытие системного просмотрщика PDF...')}
              className="w-full py-2 bg-[#006763] text-white rounded-md font-medium text-xs hover:bg-[#00524f] transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Открыть во внешнем вьюере</span>
            </button>
          </aside>
        )}
      </div>

      {/* ==================== MODAL: FACT VERIFICATION (STATE 5) ==================== */}
      {verificationModalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white max-w-lg w-full rounded-xl border border-slate-200 shadow-xl overflow-hidden space-y-4 text-xs">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-[#006763]" />
                <span className="font-semibold text-slate-800 text-sm">Верификация обнаруженного факта</span>
              </div>
              <button 
                onClick={() => setVerificationModalType(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <div className="text-[11px] font-mono text-slate-400">Распознанный фрагмент выписки:</div>
                <p className="font-semibold text-slate-800 font-mono text-xs">
                  {verificationModalType === 'magne'
                    ? '«Рекомендовано: Магне B6 форте по 1 таблетке 2 раза в сутки во время еды — 1 месяц» (Выписка терапевта ГКБ_12.10.2026.pdf, Стр. 2)'
                    : '«Ферритин: 18 мкг/л (Референс 20-250 мкг/л). Заключение лаборатории: признаки латентного железодефицита» (Инвитро_14.10.2026.pdf)'}
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 text-xs">Действие над фактом:</label>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2.5 p-2 bg-slate-50 hover:bg-slate-100 rounded-md cursor-pointer border border-slate-200/80">
                    <input 
                      type="radio" 
                      name="verifyAction"
                      checked={verificationAction === 'add'}
                      onChange={() => setVerificationAction('add')}
                      className="accent-[#006763]"
                    />
                    <span>Добавить в активный список назначений с отслеживанием приёма</span>
                  </label>
                  <label className="flex items-center gap-2.5 p-2 bg-slate-50 hover:bg-slate-100 rounded-md cursor-pointer border border-slate-200/80">
                    <input 
                      type="radio" 
                      name="verifyAction"
                      checked={verificationAction === 'anamnesis'}
                      onChange={() => setVerificationAction('anamnesis')}
                      className="accent-[#006763]"
                    />
                    <span>Сохранить только как факт в клиническую историю (в анамнез)</span>
                  </label>
                  <label className="flex items-center gap-2.5 p-2 bg-slate-50 hover:bg-slate-100 rounded-md cursor-pointer border border-slate-200/80">
                    <input 
                      type="radio" 
                      name="verifyAction"
                      checked={verificationAction === 'reject'}
                      onChange={() => setVerificationAction('reject')}
                      className="accent-[#006763]"
                    />
                    <span>Отклонить (ошибка автоматического распознавания)</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button 
                onClick={() => setVerificationModalType(null)}
                className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-md font-medium text-xs hover:bg-slate-50"
              >
                Отмена
              </button>
              <button 
                onClick={handleApplyVerification}
                className="px-4 py-1.5 bg-[#006763] hover:bg-[#00524f] text-white rounded-md font-medium text-xs shadow-xs transition-colors"
              >
                Применить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL: FITNESS TRACKER IMPORT CSV/JSON (STATE 9 & 10) ==================== */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white max-w-md w-full rounded-xl border border-slate-200 shadow-xl overflow-hidden space-y-4 text-xs">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-[#006763]" />
                <span className="font-semibold text-slate-800 text-sm">Импорт данных носимого устройства</span>
              </div>
              <button 
                onClick={() => setIsImportModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <p className="text-slate-500">
                Поддерживаются выгрузки: Apple Health (export.xml / csv), Garmin Connect (.fit / .csv), Xiaomi Mi Fitness (.json).
              </p>

              {/* Upload Drag & Drop Dropzone */}
              <div 
                onClick={() => {
                  setImportFileName('apple_health_synced_export.csv (Готов к разбору)');
                  showToast('Файл выбран для разбора');
                }}
                className="border-2 border-dashed border-teal-300 hover:border-[#006763] p-6 rounded-xl bg-teal-50/30 text-center cursor-pointer space-y-2 transition-colors"
              >
                <Upload className="w-8 h-8 text-[#006763] mx-auto" />
                <div className="font-semibold text-slate-800 text-xs">Нажмите для выбора файла или перетащите сюда</div>
                <span className="text-[11px] text-slate-400 font-mono block">
                  {importFileName}
                </span>
              </div>

              {/* Error Alert Box (State 10) */}
              {importHasError && (
                <div className="p-3 bg-rose-50 text-rose-800 rounded-lg border border-rose-200 space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-rose-700">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Ошибка разбора файла:</span>
                  </div>
                  <p>
                    Некорректная кодировка заголовков CSV или поврежден JSON-манифест трекера (строка 144: unexpected token).
                  </p>
                </div>
              )}
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
              <button 
                onClick={() => setImportHasError(prev => !prev)}
                className="text-rose-600 font-medium text-[11px] hover:underline"
              >
                {importHasError ? 'Скрыть ошибку' : 'Имитировать ошибку'}
              </button>
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-md font-medium text-xs hover:bg-slate-50"
                >
                  Отмена
                </button>
                <button 
                  onClick={() => {
                    if (importHasError) {
                      showToast('Сбой импорта: устраните ошибку формата файла', 'error');
                      return;
                    }
                    setIsImportModalOpen(false);
                    setHasBraceletData(true);
                    showToast('Успешно импортировано: 120 480 измерений ЧСС, 7 дней сна и шагов!');
                  }}
                  className="px-4 py-1.5 bg-[#006763] hover:bg-[#00524f] text-white rounded-md font-medium text-xs shadow-xs transition-colors"
                >
                  Импортировать
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
